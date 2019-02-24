## Requirements
* The system shall correctly generate valid React Native code with proper styling of components such that the code rendered on a platform (currently; web, android and ios) would match the
design described by the json object 100%. The design described by the json object has also a png version to check whether design matches or not.
* The system shall correctly classify the display property of a view according to its positioning in the container it belongs and its children's positioning. The valid display properties are `block` and `flex`.
* The system shall correctly give layout properties of a flex container. (`flex-direction`, `flex-wrap`, `justify-content` and `align-items`).
* The system shall correctly determine whether `flex-direction` is `row` or `column`.
* The system shall correctly determine whether `flex-wrap` is `wrap`, `nowrap`.
* The system shall correctly give `justify-content` property that is one of `flex-start`, `flex-end`, `center`, `space-between`, `space-around` and `space-evenly`.
* The system shall correctly give `align-items` property that is one of `flex-start`, `flex-end`, `center`, `stretch` and `baseline`.

* The system shall have an option for the users of the system to choose to calculate position of a view by giving `padding` to its container or giving `margin` to view itself.
* The system shall correctly calculate parent - children relationship of views.
* The system shall correctly calculate positioning of a child with respect to its position in container and its position with respect to its siblings. These position determining properties of a view are `margin` and `padding`.