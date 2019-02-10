# Generating semantic UI code from Zeplin screens and components
## Introduction
The aim of the project is to generate semantic UI code from Zeplin screens and components in React Native.

## Glossary
* __Zeplin screens and components__ are two well defined data structures that contain enough information for any design to be implemented in any UI platform by a developer. Zeplin screens could also contain components.

* __Semantic UI code__ is the UI code introducing meaning of the elements in the design to the platform's markup language rather than just presentation. As an example, a `<h1>` tag gives the text it wraps around the meaning of "a top level heading on the page" in HTML.

* __React__ is a Javascript library for building user interfaces. It is generally used with an HTML like syntax called JSX.

* __React Native__ is a framework to build native mobile apps using Javascript and React. Although it specifically started as a way to build native mobile apps using Javascript; its' scope is extended to include other target platforms such as web, windows, mac etc.

* __React Native components__ are basic building blocks for a user interface such as
    - `View` - a component to separate parts of the UI
    - `Text` - a component to render text
    - `Image` - a component to render image
    - `StyleSheet` - a component to specify visual and layout properties of a component very similar to CSS StyleSheets.

With the help of these definitions; we can rephrase our aim as to translate a design represented by well defined data structures to JSX code with React Native components.
## Requirements
* Output of the generated code shall match the design specs given by screen and component data structures.
* Generated code shall be usable by a developer building on top of the design given by data structures. So, a typical workflow of a developer could be; `see the design -> generate code of the design -> implement business logic over that generated UI code`.
* Generated code shall contain not only presentation of the design but semantics of the design elements. (A paragraph shall be `<p>`)

## Challenges
* The data structures contain just enough information for a design to be represented. So, it does not contain any layout implementation details. We need to understand and extract those details.
* After extracting layout details; we need to generate code that also contains styling of the components. (Getting style information from the data is trivial since that representation maps to implementation)
* The non-trivial part of generating code after extracting layout details is understanding the semantic context of the component. Is this a `Heading` or is this component a `List` component that includes other components…
* After understanding semantic context of the components, we can generate the code.

## Similar studies
* [Airbnb - Sketching interfaces](https://airbnb.design/sketching-interfaces/) — Creating code from low fidelity wireframes
* [Microsoft - Sketch2Code](https://sketch2code.azurewebsites.net/) — Transform any hands-drawn design into a HTML code with AI
* [Floydhub - Turning Design Mockups Into Code With Deep Learning](https://blog.floydhub.com/turning-design-mockups-into-code-with-deep-learning/) — Turning design mockups into code with deep learning

These studies worked on generating UI code from drawing images. So, they tried to solve two problems: firstly, they tried to convert drawing images into meaningful data structures; secondly, they tried to generate code from generated data structures. Since we have meaningful data structures representing the UI we only are interested in the second part of the problem.