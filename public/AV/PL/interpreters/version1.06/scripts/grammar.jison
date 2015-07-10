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
"/"                   		      { return 'DIV'; }
"%"                   		      { return 'REM'; }
"->"                                  { return 'MAP'; }
"-"                   		      { return 'MINUS'; }
"<"                   		      { return 'LT'; }
">"                   		      { return 'GT'; }
"==="                  		      { return 'EQ'; }
"~"                   		      { return 'NEG'; }
"not"                  		      { return 'NOT'; }
"add1"                                { return 'ADD1'; }
","                   		      { return 'COMMA'; }
"=>"                   		      { return 'THATRETURNS'; }
"if"                   		      { return 'IF'; }
"then"                   	      { return 'THEN'; }
"else"                   	      { return 'ELSE'; }
"["                                   { return 'LBRACKET'; }
"]"                                   { return 'RBRACKET'; }
"hd"                                  { return 'HEAD'; }
"tl"                                  { return 'TAIL'; }
"::"                                  { return 'CONS'; }
"isNull"                              { return 'ISNULL'; }
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
    | prim1_app_exp { $$ = $1; }
    | prim2_app_exp { $$ = $1; }
    | if_exp        { $$ = $1; }    
    | list_exp      { $$ = $1; }
    ;

var_exp
    : VAR  { $$ = SLang.absyn.createVarExp( $1 ); }
    ;

intlit_exp
    : INT  { $$ =SLang.absyn.createIntExp( $1 ); }
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

prim1_app_exp
    : prim1_op LPAREN exp RPAREN
       { $$ = SLang.absyn.createPrim1AppExp($1,$3); }
    ;

prim2_app_exp
    : LPAREN exp prim2_op exp RPAREN
       { $$ = SLang.absyn.createPrim2AppExp($3,$2,$4); }
    ;

prim1_op
    :  ADD1     { $$ = $1; }
    |  NEG      { $$ = $1; }
    |  NOT      { $$ = $1; }
    |  HEAD     { $$ = $1; }
    |  TAIL     { $$ = $1; }
    |  ISNULL   { $$ = $1; }
    ;

prim2_op
    :  PLUS     { $$ = $1; }
    |  MINUS    { $$ = $1; }
    |  TIMES    { $$ = $1; }
    |  DIV      { $$ = $1; }
    |  REM      { $$ = $1; }
    |  LT       { $$ = $1; }
    |  GT       { $$ = $1; }
    |  EQ       { $$ = $1; }
    |  CONS     { $$ = $1; }
    |  MAP      { $$ = $1; }
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

if_exp
    : IF exp THEN exp ELSE exp { $$ = SLang.absyn.createIfExp($2,$4,$6); }
    ;

list_exp
    : LBRACKET int_list RBRACKET { $$ = SLang.absyn.createListExp($2); } 
    ;

int_list
    : /* empty */        { $$ = []; }
    | INT more_ints      { $2.unshift(parseInt($1)); $$ = $2; }
    ;

more_ints
    : /* empty */         { $$ = []; }
    | COMMA INT more_ints { $3.unshift(parseInt($2)); $$ = $3;}
    ;
%%

