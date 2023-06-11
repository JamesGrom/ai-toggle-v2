import { app, BrowserWindow, desktopCapturer, ipcMain } from "electron";
import path from "path";
import Tesseract from "tesseract.js";
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
	app.quit();
}

let mainWindow: BrowserWindow | null;
const createWindow = (): void => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		height: 600,
		width: 800,
		webPreferences: {
			preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
			nodeIntegration: true,
		},
	});

	// and load the index.html of the app.
	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

	// Open the DevTools.
	mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on("snapshot:capture", () => {
	desktopCapturer
		.getSources({ types: ["screen", "window"] })
		.then((sources) => {
			console.log("snapshot:capture called");
			const image = sources[0].thumbnail.toDataURL();
			mainWindow?.webContents?.send("snapshot:captured", image);
		})
		.catch((err) => {
			console.error(err, "error on snapshot capture");
		});
});

ipcMain.on("snapshot:getSources", () => {
	desktopCapturer.getSources({ types: ["screen", "window"] }).then((sources) => {
		mainWindow?.webContents?.send("snapshot:availableSources", sources);
	});
});

ipcMain.on("snapshot:save", (event, data) => {
	console.log("snapshot:save called");
	console.log(data);
});
ipcMain.on("ocr", async (event, data) => {
	console.log("ocr called");
	console.log(`${path.join(__dirname)}`);
	// const initTesseract = async () => {
	// 	tesseractWorker = await createWorker({
	// 		workerPath: "./node_modules/tesseract.js/dist/worker.min.js",
	// 		workerBlobURL: false,
	// 		logger: (m) => console.log(m),
	// 	});
	// 	// await tesseractWorker.loadLanguage("eng");
	// 	// await tesseractWorker.initialize("eng");
	// };
	// initTesseract();
	console.log(`dirname`, __dirname);
	// Tesseract.recognize(data, "eng", {
	// 	workerPath: "./node_modules/tesseract.js/dist/worker.min.js",
	// 	// langPath: "https://tessdata.projectnaptha.com/4.0.0",
	// 	// corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@v4.0.3",
	// });
	// Tesseract.recognize(data, "eng", {
	// 	logger: (m) => console.log(m),
	// workerPath: "./node_modules/tesseract.js/dist/worker.min.js",
	// }).then(({ data: { text } }) => {
	// 	console.log(text);
	// });
	// const worker = await createWorker({
	// workerPath: "./node_modules/tesseract.js/dist/worker.min.js",
	// 	logger: (m) => console.log(m),
	// });
});
