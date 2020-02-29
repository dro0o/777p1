# ![](/media/nitrate_personal_favicon_26.png) Nitrate & Cancer Spatial Analysis Application

**_[Live](https://pittman.dev/spatialanalysis/) Spatial analysis application developed to explore the potential relationship between nitrate levels and cancer rates._**
**[Video Overview](https://youtu.be/fQldeX4Gc7E)**

**Tech Stack**

- [Mapbox GL JS](https://github.com/mapbox/mapbox-gl-js)
- [Create React App](https://github.com/facebook/create-react-app)
- [ReactJS](https://reactjs.org/)
- [Material UI](https://material-ui.com/)
- [TurfJS](https://turfjs.org/)
- [RegressionJS](https://github.com/Tom-Alexander/regression-js)
- [SimpleStatisticsJS](https://simplestatistics.org/)
- [ShapefileJS](https://github.com/calvinmetcalf/shapefile-js)
- [Workerize-Loader](https://github.com/developit/workerize-loader)

**Graduate Program**

- [UW GIS WMP](https://geography.wisc.edu/gis/onlinemasters/)
- [Capstone Project 1](https://geography.wisc.edu/gis/gis-professional-programs-course-curriculum/)
- [Project Report](/media/777Project1_FinalReport_AndrewPittman.pdf)

## ![](/media/nitrate_personal_favicon_18.png) Previews

**Spatial regression layer of hexagon extrusions, showing tooltip with layer data, standardized residual, and R<sup>2</sup> value:**
![](/media/spatialanalysis1.gif)

**Nitrate point layer overlayed on normalized cancer tract layer, showing tooltip with layer data as appropriate:**
![](/media/spatialanalysis2.gif)

**Recalculating aggregation and spatial regression with web workers for seamless user experience:**
![](/media/spatialanalysis3.gif)

**Deep dive into nitrate point data and normalized cancer rates:**
![](/media/spatialanalysis4.gif)

## ![](/media/nitrate_personal_favicon_18.png) Screenshots

**Only raw nitrate value and normalized cancer rate input data:**
![](/media/raw_data.png)

**Optimized inputs for highest R<sup>2</sup> value:**
![](/media/R2_bestcase.png)

## ![](/media/nitrate_personal_favicon_18.png) Contributing

- Clone the repository to your projects directory

```bash
cd /your/project/dir/
git clone git@github.com:dro0o/777p1.git
```

- Change directory into the clone directory

```bash
cd ./777p1
```

- Setup node_modules with npm install

```bash
npm install
```

- For live editing

```bash
npm start
```

## ![](/media/nitrate_personal_favicon_18.png) Branding

![](/media/nitrate_personal.png)

## ![](/media/nitrate_personal_favicon_18.png) Scripts

![](/media/favicon.ico)

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. <br />This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies <br />(webpack, Babel, ESLint, etc) right into your project so you have full control over them. <br />All of the commands except `eject` will still work, but they will point to the copied scripts <br />so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, <br />and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t <br />be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
