## Flex direction determination algorithm
For a flex container;

#### If it has only one child
return __column__

#### If it has two or more children
__then__
- If all of the children have the same x values and their y values are different; then return __column__
- If all of the children have the same y values and their x values are different; then return __row__

__else__
- throw error