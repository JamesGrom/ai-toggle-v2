import { FC, useEffect, useRef, useState } from "react";
const Home: FC<any> = ({ ...props }) => {
	const ipcRenderer = (window as any).ipcRenderer;
	// useState
	const [snapshot, setSnapshot] = useState<null | string>(null);
	const [imageFramePreviewSrc, setImageFramePreviewSrc] = useState<null | string>(null);
	const [snapshotSource, setSnapshotSource] = useState<null | Electron.DesktopCapturerSource>(null);
	// useRef
	const videoRef = useRef<null | HTMLVideoElement>(null);
	const canvasRef = useRef<null | HTMLCanvasElement>(null);
	const imageFramePreviewRef = useRef<null | HTMLImageElement>(null);
	const activeStreamRef = useRef<null | MediaStream>(null);

	useEffect(() => {
		ipcRenderer.on("snapshot:captured", (event: any) => {
			console.log(`app.tsx recieved a captured snapshot with following event payload ${event}`);
			setSnapshot(event);
		});
		ipcRenderer.on("snapshot:availableSources", (event: any) => {
			console.log(`app.tsx recieved the following availableSources: ${JSON.stringify(event)}`);
			setSnapshotSource((event as Electron.DesktopCapturerSource[])[0]);
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
						activeStreamRef.current = stream;
					}
				});
		});
	}, []);
	const grabAndPreviewFrame = () => {
		if (canvasRef?.current != null && videoRef?.current != null) {
			const context = canvasRef.current.getContext("2d");
			context.drawImage(
				videoRef.current,
				0,
				0,
				videoRef.current.videoWidth,
				videoRef.current.videoHeight
			);
			// log video dimensions
			console.log(
				`video dimensions: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`
			);
			console.log(`canvas dimensions: ${canvasRef.current.width}x${canvasRef.current.height}`);
			console.log(
				`imageFramePreviewRef dimensions: ${imageFramePreviewRef.current.width}x${imageFramePreviewRef.current.height}`
			);
			//save image to file
			const dataURL = canvasRef.current.toDataURL("image/png");
			// save dataURL to filesystem
			ipcRenderer.send("snapshot:save", dataURL);
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
			<canvas
				ref={canvasRef}
				width={videoRef?.current?.videoWidth ?? "100%"}
				height={videoRef?.current?.videoHeight ?? "100%"}
			></canvas>
			<div>
				<img
					ref={imageFramePreviewRef}
					src={imageFramePreviewSrc}
					width="100%"
					style={{ objectFit: "cover", width: "100%", height: "100%", objectPosition: "center" }}
				></img>
			</div>
			<button
				onClick={() => {
					grabAndPreviewFrame();
				}}
			>
				Snapshot
			</button>
			<button id="startBtn" className="button is-primary">
				Start
			</button>
			<button
				id="stopBtn"
				className="button is-warning"
				onClick={() => {
					// stop video stream
					if (activeStreamRef?.current != null) {
						activeStreamRef.current.getTracks().forEach((track) => {
							track.stop();
						});
					}
				}}
			>
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
