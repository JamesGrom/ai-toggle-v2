// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("ipcRenderer", {
	send: (channel: string, data: any) => ipcRenderer.send(channel, data),
	on: (channel: string, func: any) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
});
