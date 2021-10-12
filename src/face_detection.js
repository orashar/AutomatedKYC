import React from 'react'

/**
* @author
* @function FaceVerify
**/

export const FaceVerify = (props) => {
    const videoRef = useRef(null)
    const streamRef = useRef(null)
    const imgref_ref = useRef(null)
    const canvasRef = useRef(null)
  
    const loadModels = async () => {
      await faceapi.loadSsdMobilenetv1Model('./models')
      await faceapi.loadFaceLandmarkModel('./models')
      await faceapi.loadFaceRecognitionModel('./models')
    }
  
    const startVideo = () => {
      navigator.getUserMedia(
        {video: {}},
        stream => {
          videoRef.current.srcObject = stream
          streamRef.current = stream
        },
        err => console.error(err)
      )
    }
  
    const stopVideo = () => {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      });
    }
  
    const capturePic = () => {
      console.log("capture")
      canvasRef.current.getContext('2d').drawImage(videoRef.current, 0, 0, 200, 200)
    }
  
    const matchPics = async () => {
  
      const det1 = await faceapi.detectSingleFace(imgref_ref.current).withFaceLandmarks().withFaceDescriptor()
  
  
      const matcher = new faceapi.FaceMatcher(det1)
  
      const det2 = await faceapi.detectSingleFace(canvasRef.current).withFaceLandmarks().withFaceDescriptor()
  
      if(det2){
        const match = matcher.findBestMatch(det2.descriptor)
        console.log("detections in id = ",det1, det2)
        const diff = faceapi.euclideanDistance(det1, det2)
        console.log("difference = ", diff, match.toString())
      }else alert("Face not found")
    }
  
    useEffect(() => {
      loadModels().then(console.log("loaded"))
    }, [])
  
    return (
      <div>
      <video ref={videoRef} width="200" height="200" autoPlay muted></video>
      <button onClick={startVideo}>start</button>
      <img ref={imgref_ref} src='id_pic.png' width="200" height="200"/>
      <canvas ref={canvasRef} width="200" height="200"></canvas>
      <br/>
      <button onClick={matchPics}>Match</button>
      <button onClick={capturePic}>Capture</button>
      <button onClick={stopVideo}>stop</button>
      </div>
    );

 }