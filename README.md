The Gag Journal
===============

The Gag Journal is a procedurally generated book, written in Javascript. This is the content-redacted version. The generated book is HTML, which can be rendered to a PDF with [wkhtmltopdf](https://github.com/wkhtmltopdf/wkhtmltopdf).

The book is populated with content from `gags.json`, which itself is generated from `dash/gags.dash` through `dash/dash2json.py`.

Dependencies
============

 - wkhtmltopdf 0.11.0

Contributing
============

If you wish to add gags to the Gag Journal, you should do the following:

1. Edit `dash/gags.dash` to add the gag.
1. Execute `dash/dash2json.py dash/gags.dash > gags.json` to generate the JSON representation of the gags.
1. Submit a pull request which contains both of those files changed.

Rendering
=========

The Journal can be rendered to `out.pdf` with the following command (assuming `wkhtmltopdf` is in your PATH):

```wkhtmltopdf -B 0 -L 0 -T 0 -R 0 -s A5 --no-stop-slow-scripts web/gag.html out.pdf```
