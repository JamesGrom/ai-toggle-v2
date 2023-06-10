import { FC, useEffect, useRef, useState } from "react";
const Home: FC<any> = ({ ...props }) => {
	const ipcRenderer = (window as any).ipcRenderer;
	const [snapshot, setSnapshot] = useState<null | string>(null);
	const [imageFramePreviewSrc, setImageFramePreviewSrc] = useState<null | string>(null);
	const videoRef = useRef<null | HTMLVideoElement>(null);
	const canvasRef = useRef<null | HTMLCanvasElement>(null);
	const imageFramePreviewRef = useRef<null | HTMLImageElement>(null);
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
			console.log(`app.tsx recieved the following availableSources: ${JSON.stringify(event)}`);
			setSnapshotSource((event as Electron.DesktopCapturerSource[])[0]);
			const constraints: MediaStreamConstraints = {
				audio: false,
				video: {
					// fra
					// advanced:[{fra}]
				},
			};
			navigator.mediaDevices
				.getUserMedia({
					audio: false,
					video: {
						mandatory: {
							chromeMediaSource: "desktop",
							chromeMediaSourceId: (event as Electron.DesktopCapturerSource[])[0].id,
							minWidth: 1280,
							maxWidth: 1280,
							minHeight: 720,
							maxHeight: 720,
						},
					},
				} as any)
				.then((stream) => {
					if (videoRef?.current != null) {
						videoRef.current.srcObject = stream;
						videoRef.current.play();
					}
				});
		});
	}, []);
	const drawImageFromVideoToCanvas = () => {
		if (canvasRef?.current != null && videoRef?.current != null) {
			const context = canvasRef.current.getContext("2d");
			context.drawImage(
				videoRef.current,
				0,
				0,
				videoRef.current.videoWidth,
				videoRef.current.videoHeight
			);
			//save image to file
			const dataURL = canvasRef.current.toDataURL("image/png");
			// set image preview
			setImageFramePreviewSrc(dataURL);
		}
	};
	return (
		<div>
			<h1>⚡ Electron Screen Recorder</h1>

			{snapshot != null && (
				<div>
					<img src={snapshot}></img>
				</div>
			)}
			{snapshotSource != null && <div>{JSON.stringify(snapshotSource)}</div>}

			<video ref={videoRef}></video>
			<canvas ref={canvasRef}></canvas>
			<div>
				<img ref={imageFramePreviewRef} src={imageFramePreviewSrc}></img>
			</div>
			<button
				onClick={() => {
					//
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
