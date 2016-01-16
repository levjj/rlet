TEX=pdflatex -interaction=nonstopmode -shell-escape
BIB=bibtex
MAIN=main

default: clean build

clean:
	-rm -f *.aux *.log $(MAIN).pdf *.bbl *.blg *.brf *.fdb_latexmk *.out *.idx *.lof *.lol *.lot *.toc *.acn *.acr *.glg *.glo *.gls *.ilg *.dvi *.alg *.ist *.ind

build:
	$(TEX) $(MAIN).tex
	$(BIB) $(MAIN)
	$(TEX) $(MAIN).tex
	$(TEX) $(MAIN).tex

html:
	ht-latex main.tex html/

run:
	nodemon -e .tex -w . -x $(TEX) $(MAIN).tex
