/* description: Grammar for Slang 1 */

/* lexical grammar */
%lex

DIGIT		      [0-9]
LETTER		      [a-zA-Z]

%%

\s+                                   { /* skip whitespace */ }
"lambda"        		      { return 'FN'; }
"("                   		      { return 'LPAREN'; }
")"                   		      { return 'RPAREN'; }
"["                   		      { return 'LBRACKET'; }
"]"                   		      { return 'RBRACKET'; }
"+"                   		      { return 'PLUS'; }
"*"                   		      { return 'TIMES'; }
"add1"                                { return 'ADD1'; }
"subtract"                            { return 'SUB'; }
"from"                                { return 'FROM'; }
"gt1"                                 { return 'GT1'; }
","                   		      { return 'COMMA'; }
"."                   		      { return 'THATRETURNS'; }
<<EOF>>               		      { return 'EOF'; }
{DIGIT}+"."{DIGIT}+                   { return 'REAL'; }
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
    | reallit_exp   { $$ = $1; }
    | fn_exp        { $$ = $1; }
    | app_exp       { $$ = $1; }    
    | prim_app_exp  { $$ = $1; }
    | sub_exp       { $$ = $1; }
    | gt1_exp       { $$ = $1; }
    ;

var_exp
    : VAR  { $$ = SLang.absyn.createVarExp( $1 ); }
    ;

intlit_exp
    : INT  { $$ = SLang.absyn.createIntExp( $1 ); }
    ;

reallit_exp
    : REAL { $$ = SLang.absyn.createRealExp( $1 ); }
    ;

gt1_exp 
    : GT1 LBRACKET args  RBRACKET { $$ = SLang.absyn.createGt1Exp( $3 ); }
    ;             

sub_exp : SUB exp FROM exp  
           { $$ = SLang.absyn.createPrimAppExp("-",[$4,$2]); }}
    ;

fn_exp
    : FN formals THATRETURNS exp
           { $$ = SLang.absyn.createFnExp($2,$4); }
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

