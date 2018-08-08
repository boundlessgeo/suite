.. _cartography.mbstyle.tutorial.expressions:

Styling with Expressions
========================

This section is a quick overview of syntax and a working example, to see a full list of expressions and their uses refer to `Mapbox Style Specification <https://www.mapbox.com/mapbox-gl-js/style-spec>`_.

Syntax
------

MBStyle expressions uses a Lisp-like syntax, represented using JSON arrays. Expressions follow this format::

   [expression_name, argument_0, argument_1, ...]

The expression_name is the expression operator, for example, you would use `*` to multiply two arguments or 'case' to create conditional logic. For a complete list of all available expressions see the Mapbox Style Specification.

The arguments are either literal (numbers, strings, or boolean values) or else themselves expressions. The number of arguments varies based on the expression.

Here’s one example using an expression to perform a basic arithmetic expression (π * 3\ :sup:`2`\ )::

   ['*', ['pi'], ['^', 3, 2]]

This example is using a '`*`' expression to multiply two arguments. The first argument is 'pi', which is an expression that returns the mathematical constant pi. The second arguement is another expression: a '^' expression with two arguments of its own. It will return 3\ :sup:`2`\ , and the result will be multiplied by π.


Unsupported
-----------

The following expressions are currently unsupported or under development in Boundless Server:

*"rgba", "to-rgba", "properties", "heatmap-density", "interpolate", "let", "var"*
