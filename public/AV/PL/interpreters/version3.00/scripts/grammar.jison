/* description: Grammar for Slang 3 */

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
"-"                   		      { return 'MINUS'; }
"<"                   		      { return 'LT'; }
">"                   		      { return 'GT'; }
"==="                  		      { return 'EQ'; }
"~"                   		      { return 'NEG'; }
"not"                  		      { return 'NOT'; }
"add1"                                { return 'ADD1'; }
"let"                                 { return 'LET'; }
"in"                                  { return 'IN'; }
"end"                                 { return 'END'; }
"print"                               { return 'PRINT'; }
"set"                                 { return 'SET'; }
";"                   		      { return 'SEMICOLON'; }
':'                                   { return 'COLON'; }
'"'                                   { return 'DQUOTE'; }
","                   		      { return 'COMMA'; }
"=>"                   		      { return 'THATRETURNS'; }
"if"                   		      { return 'IF'; }
"then"                   	      { return 'THEN'; }
"else"                   	      { return 'ELSE'; }
"="                                   { return 'EQ'; }
"{"                                   { return 'LBRACE'; }
"}"                                   { return 'RBRACE'; }
"public"                              { return 'PUBLIC'; }
"class"                               { return 'CLASS'; }
"extends"                             { return 'EXTENDS'; }
"method"                              { return 'METHOD'; }
"main"                                { return 'MAIN'; }
"protected"                           { return 'PROTECTED'; }
"Driver"                              { return 'DRIVER'; }
"new"                                 { return 'NEW'; }
"."                                   { return 'DOT'; }
"this"                                { return 'THIS'; }
"call"                                { return 'CALL'; }
<<EOF>>               		      { return 'EOF'; }
{LETTER}({LETTER}|{DIGIT}|_)*  	      { return 'VAR'; }
{DIGIT}+                              { return 'INT'; }
.                     		      { return 'INVALID'; }

/lex

%start program

%% /* language grammar */

program
    : decls 
      PUBLIC CLASS DRIVER EXTENDS VAR 
      LBRACE
              METHOD MAIN LPAREN RPAREN
              LBRACE
                      block
              RBRACE
      RBRACE
      EOF { return SLang.absyn.createProgram($1,$13); }
    ;

decls
    : /* empty */           { $$ = [ ]; }
    | class decls           { $2.unshift($1);  $$ = $2; }
    ;

class
    : CLASS VAR EXTENDS VAR LBRACE ivars methods RBRACE
          { $$ = SLang.absyn.createClass($2,$4,$6,$7); }
    ;

ivars
    : /* empty */            { $$ = [ ]; }
    | PROTECTED VAR ivars    { $3.unshift($2);  $$ = $3; }
    ;

methods
    : /* empty */            { $$ = [ ]; }
    | method methods         { $2.unshift($1);  $$ = $2; }
    ;

method
    : METHOD VAR LPAREN formals RPAREN LBRACE block RBRACE
          { $$ = SLang.absyn.createMethod($2, $4, $7); }
    ;
exp
    : var_exp       { $$ = $1; }
    | intlit_exp    { $$ = $1; }
    | fn_exp        { $$ = $1; }
    | app_exp       { $$ = $1; }    
    | prim1_app_exp { $$ = $1; }
    | prim2_app_exp { $$ = $1; }
    | if_exp        { $$ = $1; }
    | let_exp       { $$ = $1; }
    | print_exp     { $$ = $1; }
    | print2_exp    { $$ = $1; }
    | assign_exp    { $$ = $1; }
    | this_exp      { $$ = $1; }
    | new_exp       { $$ = $1; }
    | method_call   { $$ = $1; }
    ;

this_exp
    : THIS  { $$ = SLang.absyn.createThisExp(); }
    ;

new_exp
    : NEW VAR LPAREN csargs RPAREN
          { $$ = SLang.absyn.createNewExp($2,$4); }
    ;

method_call
    : CALL exp DOT VAR LPAREN csargs RPAREN
          { $$ = SLang.absyn.createMethodCall($2,$4,$6); }
    ;

var_exp
    : VAR  { $$ = SLang.absyn.createVarExp( $1 ); }
    ;

intlit_exp
    : INT  { $$ = SLang.absyn.createIntExp( $1 ); }
    ;

print_exp
    : PRINT exp { $$ = SLang.absyn.createPrintExp( $2 ); }
    ;
 
print2_exp
    : PRINT DQUOTE VAR DQUOTE optional 
           { $$ = SLang.absyn.createPrint2Exp( $3, $5 ); }
    ;

optional
    : COLON        { $$ = null; }
    | exp          { $$ = $1; }
    ;

assign_exp
    : SET VAR EQ exp  { $$ = SLang.absyn.createAssignExp( $2, $4 ); }
    ;

block
    : exp                  { $$ = [ $1 ]; }
    | exp SEMICOLON block  { $3.unshift( $1 ); $$ = $3; }
    ;

let_exp
    : LET bindings IN block END
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
           { $$ = SLang.absyn.createFnExp($3,[$6]); }
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

csargs
    : /* empty */ { $$ = [ ]; }
    |  exp more_csargs    { $2.unshift($1); $$ = $2; }
    ;

more_csargs
    : /* empty */ { $$ = [ ]; }
    | COMMA exp more_csargs { $3.unshift($2); $$ = $3; }
    ;

if_exp
    : IF exp THEN exp ELSE exp { $$ = SLang.absyn.createIfExp($2,$4,$6); }
    ;

%%

