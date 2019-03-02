## Flex direction determination algorithm
For a flex container;
input: group layer
output: flex-direction property or error
```
if layer.children.length === 1
    then:
        return "column"

if layer.children.length > 1
    then:
        for i = 0 to children.length - 1:
            formerChild <- children[i]
            latterChild <- children[i + 1]
            xDifference <- latterChild.rect.x - formerChild.rect.x
            yDifference <- latterChild.rect.y - formerChild.rect.y
            if xDiffence == 0 and yDifference >= formerChild.rect.height
                then:
                    direction <- "column"
                    break;

            if yDifference ==0 and xDifference >= formerChild.rect.width
                then:
                    direction <- "row"
                    break;

            throw error ("the two child cannot be laid off in a flex container")
    return direction
```