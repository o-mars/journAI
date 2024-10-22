import React, { useEffect } from 'react';
import { WavRecorder, WavStreamPlayer } from '../../lib/wavtools/index.js';
import { useRef, useState } from 'react';
import { useRealtimeClient } from '../../contexts/RealtimeClientContext';
import { WavRenderer } from '../../utils/wav_renderer';
import './AudioInput.css';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { ReactComponent as MicOffIcon } from '../../assets/icons/mic-off.svg';
import { ReactComponent as MicOnIcon } from '../../assets/icons/mic-on.svg';


export function AudioInput() {
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const serverCanvasRef = useRef<HTMLCanvasElement>(null);

  const { client } = useRealtimeClient();

  const [didLoad, setDidLoad] = useState(false);
  const [isPushToTalkMode, setIsPushToTalkMode] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: 24000 })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );

  const initWavs = async () => {
    if (wavRecorderRef.current.getStatus() === 'ended') await wavRecorderRef.current.begin();
    await wavStreamPlayerRef.current.connect();
    console.log('init wavs');
  }

  const cleanupWavs = async () => {
    if (wavRecorderRef.current.getStatus() !== 'ended') await wavRecorderRef.current.end();
    await wavStreamPlayerRef.current.interrupt();
    console.log('cleaned up wavs');

  }

  useEffect(() => {
    console.log('initital initWavs')
    initWavs();
    
    return () => {
      cleanupWavs();
    }
  }, []);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, `users/${user.uid}`);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const preferences = userDoc.data().preferences;
            setIsPushToTalkMode(preferences.isPTT);
            console.log('fetched user prefs... PTT is ', preferences.isPTT);
          }
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setDidLoad(true);
      }
    };

    fetchPreferences();
  }, []);
  
  const startRecording = async () => {
    await initWavs();
    setIsRecording(true);
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const trackSampleOffset = await wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId && client && client.isConnected()) {
      const { trackId, offset } = trackSampleOffset;
      await client.cancelResponse(trackId, offset);
    }
    await wavRecorder.record((data) => client && client.isConnected() && client.appendInputAudio(data.mono));
  };

  const stopRecording = async () => {
    setIsRecording(false);
    const wavRecorder = wavRecorderRef.current;
    if (wavRecorder.getStatus() === 'recording') await wavRecorder.pause();
    if (client && client.isConnected()) client.createResponse();
  };

  const changeTurnEndType = async () => {
    const value = isPushToTalkMode ? 'none' : 'server_vad';
    const wavRecorder = wavRecorderRef.current;
    if (value === 'none' && wavRecorder.getStatus() === 'recording') {
      await wavRecorder.pause();
    }
    if (client) {
      client.updateSession({
        turn_detection: value === 'none' ? null : { type: 'server_vad' },
      });
      if (value === 'server_vad') {
        if (!wavRecorder.processor) await wavRecorder.begin();
        await wavRecorder.record((data) => client.isConnected() && client.appendInputAudio(data.mono));
      }
    }
  };

  useEffect(() => {
    if (didLoad) {
      changeTurnEndType();
    }
  }, [isPushToTalkMode, didLoad]);

  useEffect(() => {
    
    let isLoaded = true;

    const wavRecorder = wavRecorderRef.current;
    const clientCanvas = clientCanvasRef.current;
    let clientCtx: CanvasRenderingContext2D | null = null;

    const wavStreamPlayer = wavStreamPlayerRef.current;
    const serverCanvas = serverCanvasRef.current;
    let serverCtx: CanvasRenderingContext2D | null = null;

    const render = () => {
      if (isLoaded) {
        if (clientCanvas) {
          if (!clientCanvas.width || !clientCanvas.height) {
            clientCanvas.width = clientCanvas.offsetWidth;
            clientCanvas.height = clientCanvas.offsetHeight;
          }
          clientCtx = clientCtx || clientCanvas.getContext('2d');
          if (clientCtx) {
            clientCtx.clearRect(0, 0, clientCanvas.width, clientCanvas.height);
            const result = wavRecorder.recording
              ? wavRecorder.getFrequencies('voice')
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              clientCanvas,
              clientCtx,
              result.values,
              '#0099ff',
              10,
              0,
              8
            );
          }
        }
        if (serverCanvas) {
          if (!serverCanvas.width || !serverCanvas.height) {
            serverCanvas.width = serverCanvas.offsetWidth;
            serverCanvas.height = serverCanvas.offsetHeight;
          }
          serverCtx = serverCtx || serverCanvas.getContext('2d');
          if (serverCtx) {
            serverCtx.clearRect(0, 0, serverCanvas.width, serverCanvas.height);
            const result = wavStreamPlayer.analyser
              ? wavStreamPlayer.getFrequencies('voice')
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              serverCanvas,
              serverCtx,
              result.values,
              '#009900',
              10,
              0,
              8
            );
          }
        }
        window.requestAnimationFrame(render);
      }
    };
    render();

    return () => {
      isLoaded = false;
    };
  }, []);

  const timerRef = useRef<number | null>(null);

  const handleMouseDownOrTouchStart = () => {
  //   if (!isPushToTalkMode) return;
  //   timerRef.current = window.setTimeout(() => {
  //     startRecording();
  //   }, 200);
  };

  const handleMouseUpOrTouchEnd = () => {
    setIsPushToTalkMode(!isPushToTalkMode);
  //   if (timerRef.current) {
  //     clearTimeout(timerRef.current);
  //   }

  //   if (isPushToTalkMode && isRecording) {
  //     stopRecording();
  //   } else {
  //     setIsPushToTalkMode(!isPushToTalkMode);
  //   }
  };


  return (
    <>
      <div className="audio-input-container">
        <div className="visualization">
          <div className="visualization-entry client">
            <canvas ref={clientCanvasRef} />
          </div>

          <button
            onMouseDown={handleMouseDownOrTouchStart}
            onMouseUp={handleMouseUpOrTouchEnd}
            onTouchStart={handleMouseDownOrTouchStart}
            onTouchEnd={handleMouseUpOrTouchEnd}
            className={`mic-button ${isPushToTalkMode ? 'ptt' : 'vad'} ${isRecording ? 'recording' : 'idle'}`}
          >
            { !isPushToTalkMode ? <MicOnIcon /> : <MicOffIcon />}
            {/* { !isPushToTalkMode ? 'Mic Enabled' : 'Mic Disabled'} */}
          </button>


          <div className="visualization-entry server">
            <canvas ref={serverCanvasRef} />
          </div>
        </div>
      </div>
    </>
  );
}