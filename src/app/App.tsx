import { FC, useEffect, useRef, useState } from "react";
const Home: FC<any> = ({ ...props }) => {
	const ipcRenderer = (window as any).ipcRenderer;
	// useState
	const [snapshot, setSnapshot] = useState<null | string>(null);
	const [snapshotSource, setSnapshotSource] = useState<null | Electron.DesktopCapturerSource>(null);
	// useRef
	const videoRef = useRef<null | HTMLVideoElement>(null);
	const canvasRef = useRef<null | HTMLCanvasElement>(null);
	const activeStreamRef = useRef<null | MediaStream>(null);
	const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({
		width: 0,
		height: 0,
	});

	const updateCanvasSize = () => {
		if (canvasRef?.current != null && videoRef?.current != null) {
			// set canvas size to video size
			setCanvasSize({ width: videoRef.current.videoWidth, height: videoRef.current.videoHeight });
		}
	};
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
							minHeight: 720,
							maxFrameRate: 1,
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
		videoRef.current.addEventListener("loadedmetadata", () => {
			updateCanvasSize();
		});
	}, []);
	const grabAndPreviewFrame = () => {
		if (canvasRef?.current != null && videoRef?.current != null) {
			const context = canvasRef.current.getContext("2d");
			context.drawImage(videoRef.current, 0, 0, canvasSize.width, canvasSize.height);
			const dataURL = canvasRef.current.toDataURL("image/png");
			ipcRenderer.send("snapshot:save", dataURL);
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
				width={canvasSize.width}
				height={canvasSize.height}
				style={{ backgroundColor: "red" }}
			></canvas>

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
					ipcRenderer.send("snapshot:getSources");
				}}
			>
				Choose Video Source
			</button>
		</div>
	);
};
export default Home;
