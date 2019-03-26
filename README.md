# Semantic Web Augmentation Extension

SWAX is a Chrome extension developed using WebExtensions. It allows end-users to build Web Augmentations for Web pages with content extracted from the Semantic Web. Users are capable of enabling the tool in any website, initiating the configuration of the augmentation via a pipeline process in an intuitive sequence of steps. The result is a script that is general enough to augment all Web pages whose DOM structure and semantics are similar to the original one. One configuration, several executions.

## Requisites

* [`node.js`](https://nodejs.org/)

## Installation

Users must:

* Download the extension zip from this repository.
* Extract the extension.
* Run `npm install` within the extension directory.
* In Chrome:
    * Go to `chrome://extensions/`.
    * Enable *Developer mode*.
    * Choose *Load unpacked extension*.
    * Select extension's directory.

## Usage

Once installed the extension, a button is added to the extensions buttons bar, besides current URL. This button is present in every website, and the user must click it to launch the extension. The wizard-like UI will guide s/he trough the process.

Note: The speed of the Semantic Web information gathering depends on DBpedia's SPARQL endpoint.

## Demo

* [One augmented element](https://youtu.be/38jpS2qCn4w)
* [Many augmented elements](https://youtu.be/7nUVjLiH5pM)