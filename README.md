Schema generator
================

Please keep in mind that this project is still in the development phase.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Build instructions

_You need to manually build and link model-driven-data library:_

1. Clone [model-driven-data (mdd) library](https://github.com/sstenchlak/model-driven-data) to a separate directory.
2. Build the model-driven-data library by running `npm install` and `npm run build` in the mdd directory.
3. Link the package by running `npm link` in the mdd directory.

_To build the project:_

4. In the project directory run `npm install` and `npm link model-driven-data` to install all the dependencies and link the mdd library.
5. Run `npm run build` to build the project. All generated files are in the `buid` directory.
   Alternatively, you can run live server by `npm run start`.
   
---

Tento repozitář je udržován v rámci projektu OPZ č. CZ.03.4.74/0.0/0.0/15_025/0013983.
![Evropská unie - Evropský sociální fond - Operační program Zaměstnanost](https://data.gov.cz/images/ozp_logo_cz.jpg)
