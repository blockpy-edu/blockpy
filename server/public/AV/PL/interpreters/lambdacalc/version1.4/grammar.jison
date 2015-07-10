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
"true"                                { return 'TRUE'; }
"false"                               { return 'FALSE'; }
"succ"                                { return 'SUCC'; }
{DIGIT}                               { return 'DIGIT'; }
{LETTER}({LETTER}|{DIGIT}|_)*  	      { return 'VAR'; }
"."                                   { return 'DOT'; }
"+"                                   { return 'PLUS'; }
"*"                                   { return 'TIMES'; }
"!"                                   { return 'NOT'; }
"&&"                                  { return 'AND'; }
"||"                                  { return 'OR'; }
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
    | church   { $$ = $1; }
    ;

church
    : boolean
        { $$ = $1; }
    | 'NOT' boolean
        { $$ = LAMBDA.absyn.createNegation( $2 ); }
    | boolean  "AND" boolean 
        { $$ = LAMBDA.absyn.createConjunction($1,$3); }
    | boolean  "OR" boolean 
        { $$ = LAMBDA.absyn.createDisjunction($1,$3); }
    | number
        { $$ = $1; }
    | number "PLUS" number
        { $$ = LAMBDA.absyn.createAddition( $1,$3); }
    | number "TIMES" number
        { $$ = LAMBDA.absyn.createMultiplication( $1,$3); }
    ;

number 
    : "DIGIT"
        { $$ = LAMBDA.absyn.createNumber( Number($1) ); }
    | "LPAREN" "SUCC" number "RPAREN"
        { $$ = LAMBDA.absyn.createAppExp(LAMBDA.absyn.createSucc(), $3 ); }
    ;

boolean
    : "TRUE"   { $$ = LAMBDA.absyn.createTrue(); }
    | "FALSE"  { $$ = LAMBDA.absyn.createFalse(); }
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

