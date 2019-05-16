# Generating UI layout code from Zeplin screens and components using a seq2seq network
## Introduction
The aim of the project is to layout UI code from Zeplin screens and components in React Native

## High Level Requirements
* Output of the generated code shall match the design specs given by screen and component data structures.
* Generated code shall be usable by a developer building on top of the design given by data structures. So, a typical workflow of a developer could be; `see the design -> generate code of the design -> implement business logic over that generated UI code`.
* Generated code shall contain not only presentation of the design but semantics of the design elements. (A paragraph shall be `<p>`)

## Challenges
* The data structures contain just enough information for a design to be represented. So, it does not contain any layout implementation details. We need to understand and extract those details.
* After extracting layout details; we need to generate code that also contains styling of the components. (Getting style information from the data is trivial since that representation maps to implementation)
* The non-trivial part of generating code after extracting layout details is understanding the semantic context of the component. Is this a `Heading` or is this component a `List` component that includes other components…
* After understanding semantic context of the components, we can generate the code.

## Current state
Currently, we've only dealt with extracting layout details and generating a code containing them using a seq2seq deep learning model.

## Usage instructions
You can follow the same steps to redo the experiments.

### Scraper
This module downloads website rectangles and markup from top 1 million Alexa websites database and converts them to dataset structure with rectangles as `x` and output markup as `y`.

```sh
npm install
npm run download-html # Downloads html files into "scraper/out" directory
npm run generate-dataset # Converts downloaded html to ".json" files with dataset file structure.
```

### Compiler
This module converts "scraper/dataset" file with html markup to data points with DSL markup. Also, exports a function for converting DSL code to RN code.

To convert dataset with html markup to data points with DSL markup; we run
```sh
node compiler/index.js --decompile # You can change the datasetDir in "compiler/index.js" to point another folder
```

### Training
After the upper steps are completed, we have a dataset that our model understands.

You need to install `tensorflow`, `keras` and `numpy` for model.

To point out to the newly database we've created; change `dir_path` of dataset generator in "model.py"
Also, there are some parameters that in the code fine tuned for my environment; you can freely remove or adjust them.

Then you run `python model.py`. This saves our model improvements into `weights/` for each epoch.

After the training complete and you have saved models. You can convert them using `tensorflowjs_converter`. To do that, you need `tensorflowjs` dependency as well.
```
pip install tensorflowjs
```

Then follow the instructions in here: https://github.com/tensorflow/tfjs-converter

### Zeplin Extension
Currently, in `zpl-extension` folder; there is an extension with pretrained and converted models. You can open `index.js` and change `tf.loadLayersModel` function's argument to try with different models.

You can follow running a Zeplin Extension and using it in Zeplin instructions from here: https://github.com/zeplin/zem

## Similar studies
* [Airbnb - Sketching interfaces](https://airbnb.design/sketching-interfaces/) — Creating code from low fidelity wireframes
* [Microsoft - Sketch2Code](https://sketch2code.azurewebsites.net/) — Transform any hands-drawn design into a HTML code with AI
* [Floydhub - Turning Design Mockups Into Code With Deep Learning](https://blog.floydhub.com/turning-design-mockups-into-code-with-deep-learning/) — Turning design mockups into code with deep learning
* [pix2code](https://github.com/tonybeltramelli/pix2code) – Generating Code from a Graphical User Interface Screenshot

These studies worked on generating UI code from drawing images. So, they tried to solve two problems: firstly, they tried to convert drawing images into meaningful data structures; secondly, they tried to generate code from generated data structures. Since we have meaningful data structures representing the UI we only are interested in the second part of the problem.
