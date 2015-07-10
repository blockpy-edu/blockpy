/* description: Grammar for Slang 1 */

/* lexical grammar */
%lex

DIGIT		      [0-9]
LETTER		      [a-zA-Z]

%%

\s+                                   { /* skip whitespace */ }
"fn"				      { return 'FN'; }
"("                   		      { return 'LPAREN'; }
")"                   		      { return 'RPAREN'; }
"+"                   		      { return 'PLUS'; }
"*"                   		      { return 'TIMES'; }
"add1"                                { return 'ADD1'; }
"let"                                 { return 'LET'; }
"in"                                  { return 'IN'; }
"end"                                 { return 'END'; }
","                   		      { return 'COMMA'; }
"=>"                   		      { return 'THATRETURNS'; }
"="                                   { return 'EQ'; }
<<EOF>>               		      { return 'EOF'; }
{LETTER}({LETTER}|{DIGIT}|_)*  	      { return 'VAR'; }
{DIGIT}+                              { return 'INT'; }
"."                                   { return 'DOT'; }
.                     		      { return 'INVALID'; }

/lex

%start program

%% /* language grammar */

program
    : exp EOF
        { return SLang.absyn.createProgram($1); }
    ;

exp
    : var_exp       { $$ = $1; }
    | intlit_exp    { $$ = $1; }
    | fn_exp        { $$ = $1; }
    | app_exp       { $$ = $1; }    
    | prim_app_exp  { $$ = $1; }
    | let_exp       { $$ = $1; }
    ;

var_exp
    : VAR  { $$ = SLang.absyn.createVarExp( $1 ); }
    ;

intlit_exp
    : INT  { $$ = SLang.absyn.createIntExp( $1 ); }
    ;

let_exp
    : LET bindings IN exp END
           { var args = $2[1]; args.unshift( "args" );
             var fnexp = SLang.absyn.createFnExp($2[0],$4);
             $$ = SLang.absyn.createAppExp(fnexp,args);
           }
    ; 

bindings
    : VAR EQ exp              
           { $$ = [ [ $1 ], [ $3 ] ]; }  
    | VAR EQ exp bindings
           { var vars = $4[0];  vars.unshift($1);
             var vals = $4[1];  vals.unshift($3);
	     $$ = [ vars, vals ];
           }  
    ;

fn_exp
    : FN LPAREN formals RPAREN THATRETURNS exp
           { $$ = SLang.absyn.createFnExp($3,$6); }
    ;

formals
    : /* empty */ { $$ = [ ]; }
    | VAR moreformals 
        { var result;
          if ($2 === [ ])
	     result = [ $1 ];
          else {
             $2.unshift($1);
             result = $2;
          }
          $$ = result;
        }
    ;

moreformals
    : /* empty */ { $$ = [ ] }
    | COMMA VAR moreformals 
       { $3.unshift($2); 
         $$ = $3; }
    ;

app_exp
    : LPAREN exp args RPAREN
       {  $3.unshift("args");
          $$ = SLang.absyn.createAppExp($2,$3); }
    ;

prim_app_exp
    : prim_op LPAREN prim_args RPAREN
       { $$ = SLang.absyn.createPrimAppExp($1,$3); }
    ;

prim_op
    :  PLUS     { $$ = $1; }
    |  TIMES    { $$ = $1; }
    |  ADD1     { $$ = $1; }
    ;

args
    : /* empty */ { $$ = [ ]; }
    | exp args
        { var result;
          if ($2 === [ ])
	     result = [ $1 ];
          else {
             $2.unshift($1);
             result = $2;
          }
          $$ = result;
        }
    ;

prim_args
    :  /* empty */ { $$ = [ ]; }
    |  exp more_prim_args    { $2.unshift($1); $$ = $2; }
    ;

more_prim_args
    : /* empty */ { $$ = [ ] }
    | COMMA exp more_prim_args { $3.unshift($2); $$ = $3; }
    ;



%%

