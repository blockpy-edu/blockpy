# updated SQLA schema display to work with pydot 1.0.2

#from sqlalchemy.orm.properties import PropertyLoader
from sqlalchemy.orm import sync
import pydot
import types

__all__ = ['create_uml_graph', 'create_schema_graph', 'show_uml_graph', 'show_schema_graph']

def _mk_label(mapper, show_operations, show_attributes, show_datatypes, bordersize):
    html = '<<TABLE CELLSPACING="0" CELLPADDING="1" BORDER="0" CELLBORDER="%d" BALIGN="LEFT"><TR><TD><FONT POINT-SIZE="10">%s</FONT></TD></TR>' % (bordersize, mapper.class_.__name__)
    def format_col(col):
        colstr = '+%s' % (col.name)
        if show_datatypes:
            colstr += ' : %s' % (col.type.__class__.__name__)
        return colstr
            
    if show_attributes:
        html += '<TR><TD ALIGN="LEFT">%s</TD></TR>' % '<BR ALIGN="LEFT"/>'.join(format_col(col) for col in sorted(mapper.columns, key=lambda col:not col.primary_key))
    else:
        [format_col(col) for col in sorted(mapper.columns, key=lambda col:not col.primary_key)]
    if show_operations:
        html += '<TR><TD ALIGN="LEFT">%s</TD></TR>' % '<BR ALIGN="LEFT"/>'.join(
            '%s(%s)' % (name,", ".join(default is _mk_label and ("%s") % arg or ("%s=%s" % (arg,repr(default))) for default,arg in 
                zip((func.func_defaults and len(func.func_code.co_varnames)-1-(len(func.func_defaults) or 0) or func.func_code.co_argcount-1)*[_mk_label]+list(func.func_defaults or []), func.func_code.co_varnames[1:])
            ))
            for name,func in mapper.class_.__dict__.items() if isinstance(func, types.FunctionType) and func.__module__ == mapper.class_.__module__
        )
    html+= '</TABLE>>'
    return html


def create_uml_graph(mappers, show_operations=True, show_attributes=True, show_multiplicity_one=False, show_datatypes=True, linewidth=1.0, font="Bitstream-Vera Sans"):
    graph = pydot.Dot(prog='neato',mode="major",overlap="0", sep="0.01",dim="3", pack="True", ratio=".75")
    relations = set()
    for mapper in mappers:
        graph.add_node(pydot.Node(mapper.class_.__name__,
            shape="plaintext", label=_mk_label(mapper, show_operations, show_attributes, show_datatypes, linewidth),
            fontname=font, fontsize="8.0",
        ))
        if mapper.inherits:
            graph.add_edge(pydot.Edge(mapper.inherits.class_.__name__,mapper.class_.__name__,
                arrowhead='none',arrowtail='empty', style="setlinewidth(%s)" % linewidth, arrowsize=str(linewidth)))
        for loader in mapper.iterate_properties:
            if isinstance(loader, PropertyLoader) and loader.mapper in mappers:
                if hasattr(loader, 'reverse_property'):
                    relations.add(frozenset([loader, loader.reverse_property]))
                else:
                    relations.add(frozenset([loader]))

    for relation in relations:
        #if len(loaders) > 2:
        #    raise Exception("Warning: too many loaders for join %s" % join)
        args = {}
        def multiplicity_indicator(prop):
            if prop.uselist:
                return ' *'
            if any(col.nullable for col in prop.local_side):
                return ' 0..1'
            if show_multiplicity_one:
                return ' 1'
            return ''
        
        if len(relation) == 2:
            src, dest = relation
            from_name = src.parent.class_.__name__
            to_name = dest.parent.class_.__name__
            
            def calc_label(src,dest):
                return '+' + src.key + multiplicity_indicator(src)
            args['headlabel'] = calc_label(src,dest)
            
            args['taillabel'] = calc_label(dest,src)
            args['arrowtail'] = 'none'
            args['arrowhead'] = 'none'
            args['constraint'] = False
        else:
            prop, = relation
            from_name = prop.parent.class_.__name__
            to_name = prop.mapper.class_.__name__
            args['headlabel'] = '+%s%s' % (prop.key, multiplicity_indicator(prop))
            args['arrowtail'] = 'none'
            args['arrowhead'] = 'vee'
        
        graph.add_edge(pydot.Edge(from_name,to_name,
            fontname=font, fontsize="7.0", style="setlinewidth(%s)"%linewidth, arrowsize=str(linewidth),
            **args)
        )

    return graph

#from sqlalchemy.databases.postgres import PGDialect
PGDialect = type
from sqlalchemy import Table, text

def _render_table_html(table, metadata, show_indexes, show_datatypes):
    def format_col_type(col):
        try:
            return col.type.get_col_spec()
        except NotImplementedError:
            return str(col.type)
    def format_col_str(col):
         if show_datatypes:
             return "- %s : %s" % (col.name, format_col_type(col))
         else:
             return "- %s" % col.name
    html = '<<TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0"><TR><TD ALIGN="CENTER">%s</TD></TR><TR><TD BORDER="1" CELLPADDING="0"></TD></TR>' % table.name 

    html += ''.join('<TR><TD ALIGN="LEFT" PORT="%s">%s</TD></TR>' % (col.name, format_col_str(col)) for col in table.columns)
    if metadata.bind and isinstance(metadata.bind.dialect, PGDialect):
        # postgres engine doesn't reflect indexes
        indexes = dict((name,defin) for name,defin in metadata.bind.execute(text("SELECT indexname, indexdef FROM pg_indexes WHERE tablename = '%s'" % table.name)))
        if indexes and show_indexes:
            html += '<TR><TD BORDER="1" CELLPADDING="0"></TD></TR>'
            for index, defin in indexes.items():
                ilabel = 'UNIQUE' in defin and 'UNIQUE ' or 'INDEX '
                ilabel += defin[defin.index('('):]
                html += '<TR><TD ALIGN="LEFT">%s</TD></TR>' % ilabel
    html += '</TABLE>>'
    return html

def create_schema_graph(tables=None, metadata=None, show_indexes=True, show_datatypes=True, font="Bitstream-Vera Sans",
    concentrate=True, relation_options={}, rankdir='TB'):
    relation_kwargs = {
        'fontsize':"7.0"
    }
    relation_kwargs.update(relation_options)
    
    if not metadata and len(tables):
        metadata = tables[0].metadata
    elif not tables and metadata:
        if not len(metadata.tables):
            metadata.reflect()
        tables = metadata.tables.values()
    else:
        raise Exception("You need to specify at least tables or metadata")
    
    graph = pydot.Dot(prog="dot",mode="ipsep",overlap="ipsep",sep="0.01",concentrate=str(concentrate), rankdir=rankdir)
    for table in tables:
        graph.add_node(pydot.Node(str(table.name),
            shape="plaintext",
            label=_render_table_html(table, metadata, show_indexes, show_datatypes),
            fontname=font, fontsize="7.0"
        ))
    
    for table in tables:
        for fk in table.foreign_keys:
            edge = [table.name, fk.column.table.name]
            is_inheritance = fk.parent.primary_key and fk.column.primary_key
            if is_inheritance:
                edge = edge[::-1]
            graph_edge = pydot.Edge(
                headlabel="+ %s"%fk.column.name, taillabel='+ %s'%fk.parent.name,
                arrowhead=is_inheritance and 'none' or 'odot' ,
                arrowtail=(fk.parent.primary_key or fk.parent.unique) and 'empty' or 'crow' ,
                fontname=font, 
                #samehead=fk.column.name, sametail=fk.parent.name,
                *edge, **relation_kwargs
            )
            graph.add_edge(graph_edge)

# not sure what this part is for, doesn't work with pydot 1.0.2
#            graph_edge.parent_graph = graph.parent_graph
#            if table.name not in [e.get_source() for e in graph.get_edge_list()]:
#                graph.edge_src_list.append(table.name)
#            if fk.column.table.name not in graph.edge_dst_list:
#                graph.edge_dst_list.append(fk.column.table.name)
#            graph.sorted_graph_elements.append(graph_edge)
    return graph

def show_uml_graph(*args, **kwargs):
    from cStringIO import StringIO
    from PIL import Image
    iostream = StringIO(create_uml_graph(*args, **kwargs).create_png())
    Image.open(iostream).show(command=kwargs.get('command','gwenview'))

def show_schema_graph(*args, **kwargs):
    from cStringIO import StringIO
    from PIL import Image
    iostream = StringIO(create_schema_graph(*args, **kwargs).create_png())
    Image.open(iostream).show(command=kwargs.get('command','gwenview'))
