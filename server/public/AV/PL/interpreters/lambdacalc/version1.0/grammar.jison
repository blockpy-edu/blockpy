/* description: Grammar for Slang 1 */

/* lexical grammar */
%lex

DIGIT		      [0-9]
LETTER		      [a-zA-Z]

%%

\s+                                   { /* skip whitespace */ }
"^"				      { return 'LAMBDA'; }
"("                   		      { return 'LPAREN'; }
")"                   		      { return 'RPAREN'; }
{LETTER}({LETTER}|{DIGIT}|_)*  	      { return 'VAR'; }
"."                                   { return 'DOT'; }
<<EOF>>               		      { return 'EOF'; }
.                     		      { return 'INVALID'; }

/lex

%start program

%% /* language grammar */

program
    : exp EOF { return LAMBDA.absyn.createProgram($1); }
    ;

exp
    : var_exp  { $$ = $1; }
    | lambda_abs   { $$ = $1; }
    | app_exp  { $$ = $1; }    
    ;

var_exp
    : VAR  { $$ = LAMBDA.absyn.createVarExp( $1 ); }
    ;

lambda_abs
    : 'LAMBDA' var_exp 'DOT' exp { $$ =LAMBDA.absyn.createLambdaAbs($2,$4); }
    ;

app_exp
    : 'LPAREN' exp exp 'RPAREN'  { $$ = LAMBDA.absyn.createAppExp($2,$3); }
    ;

%%

