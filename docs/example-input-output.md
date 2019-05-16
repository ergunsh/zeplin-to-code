## Model's example input and outputs are

Inputs are just a bunch of rectangles normalized by the viewport rectangles collected from.
```json
[
    {"x": 0, "y": 0, "width": 0.5, "height": 0.5},
    {"x": 0.1, "y": 0.1, "width": 0.1, "height": 0.1},
    {"x": 0.2, "y": 0.1, "width": 0.1, "height": 0.1},
    {"x": 0.3, "y": 0.1, "width": 0.1, "height": 0.1},
    {"x": 0.4, "y": 0.1, "width": 0.1, "height": 0.1}
]
```

Outputs are a code written in the model's DSL.
```
.flex.static.row.nowrap.{.block.static.row.nowrap.|.block.static.row.nowrap.|.block.static.row.nowrap.|.block.static.row.nowrap.}
```