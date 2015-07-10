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
","                   		      { return 'COMMA'; }
"=>"                   		      { return 'THATRETURNS'; }
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
        { console.log("No syntax errors were detected.\n");
          return createProgram($1);
        }
    ;

exp
    : var_exp  { $$ = $1; }
    | intlit_exp  { $$ = $1; }
    | fn_exp   { $$ = $1; }
    | app_exp  { $$ = $1; }    
    | prim_app_exp  { $$ = $1; }
    ;

var_exp
    : VAR  { $$ = createVarExp( $1 ); }
    ;

intlit_exp
    : INT  { $$ = createIntExp( $1 ); }
    ;

fn_exp
    : FN LPAREN formals RPAREN THATRETURNS exp
           { $$ = createFnExp($3,$6); }
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
    | VAR moreformals { $2.unshift($1); $$ = $2; }
    ;

app_exp
    : LPAREN exp args RPAREN
       { $$ = createAppExp($2,$3); }
    ;

prim_app_exp
    : prim_op LPAREN prim_args RPAREN
       { $$ = createPrimAppExp($1,$3); }
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

