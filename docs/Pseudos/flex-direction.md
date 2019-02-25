## Flex direction determination algorithm
For a flex container;

#### If it has only one child
return __column__

#### If it has two or more children
__then__
- If all of the children have the same x values and their y values are different and this difference between two consecutive elements is bigger than or equal to the height of the former; then return __column__
- If all of the children have the same y values and their x values are different and this difference between two consecutive elements is bigger than or equal to the width of the former; then return __row__

__else__
- throw error