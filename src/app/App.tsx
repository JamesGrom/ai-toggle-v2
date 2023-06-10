import { FC, useEffect, useState } from "react";
const Home: FC<any> = ({ ...props }) => {
	const ipcRenderer = (window as any).ipcRenderer;
	const [snapshot, setSnapshot] = useState<null | string>(null);
	// const [availableSources, setAvailableSources] = useState<null | Electron.DesktopCapturerSource[]>(
	// 	null
	// );
	const [snapshotSource, setSnapshotSource] = useState<null | Electron.DesktopCapturerSource>(null);
	useEffect(() => {
		ipcRenderer.on("snapshot:captured", (event: any) => {
			console.log(`app.tsx recieved a captured snapshot with following event payload ${event}`);
			setSnapshot(event);
		});
		ipcRenderer.on("snapshot:availableSources", (event: any) => {
			// const options = (event as { label: string }[]).map((source) => {
			// 	return source?.label;
			// });
			// const labels = options.reduce((prev, curr) => {
			// 	return prev + "\n " + curr;
			// }, "");
			console.log(`app.tsx recieved the following availableSources: ${JSON.stringify(event)}`);
			setSnapshotSource((event as Electron.DesktopCapturerSource[])[0]);
			// setSnapshot(event);
		});
	}, []);
	return (
		<div>
			<h1>⚡ Electron Screen Recorder</h1>

			{snapshot != null && (
				<div>
					<img src={snapshot}></img>
				</div>
			)}
			{snapshotSource != null && <div>{JSON.stringify(snapshotSource)}</div>}

			<button
				onClick={() => {
					//
					ipcRenderer.send("snapshot:capture");
				}}
			>
				Snapshot
			</button>
			<button id="startBtn" className="button is-primary">
				Start
			</button>
			<button id="stopBtn" className="button is-warning">
				Stop
			</button>

			<hr />

			<button
				id="videoSelectBtn"
				className="button is-text"
				onClick={() => {
					//
					ipcRenderer.send("snapshot:getSources");
				}}
			>
				Choose Video Source
			</button>
		</div>
	);
};
export default Home;
