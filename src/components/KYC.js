import React, { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'
import './KYC.css'

/**
* @author
* @function KYC
**/

export const KYC = (props) => {

    // refs
    const videoRef = useRef(null)
    const streamRef = useRef(null)
    const idImgRef = useRef(null)
    const canvasRef = useRef(null)
    
    //states
    const [isVideoOn, setIsVideoOn] = useState(false)
    const [idFile, setIdFile] = useState(null)
    const [userLocation, setUserLocation] = useState("")
    const [isPhotoCaptured, setIsPhotoCaptured] = useState(false)

    const loadModels = async () => {
        await faceapi.loadSsdMobilenetv1Model('./models')
        await faceapi.loadFaceLandmarkModel('./models')
        await faceapi.loadFaceRecognitionModel('./models')
      }

    useEffect(() => {
        loadModels().then(console.log("loaded"))
      }, [])

    const changeFile = (e) => {
        setIdFile(e.target.files[0])
    }

    const capturePic = () => {
        if(isVideoOn){
            console.log("capture")
            canvasRef.current.getContext('2d').drawImage(videoRef.current, 0, 0, 200, 200)
            streamRef.current.getTracks().forEach(track => {
                track.stop()
              });
            setIsPhotoCaptured(true)
        }else{
            navigator.getUserMedia(
                {video: {}},
                stream => {
                  videoRef.current.srcObject = stream
                  streamRef.current = stream
                  setIsVideoOn(true)
                },
                err => {
                    console.error(err)
                    setIsVideoOn(false)
                }
              )
            setIsPhotoCaptured(false)
        }
      }

      const reverseGeolocate = async (lat, long) => {
          const LOCATION_API_KEY = "pk.fccf22209d9a90a5cba88f11c7c8bfdb"
          const url = `https://eu1.locationiq.com/v1/reverse.php?key=${LOCATION_API_KEY}&lat=${lat}&lon=${long}&format=json`
          await fetch(url)
                .then(res => res.json())
                .then(data => {
                    console.log(data.address)
                    setUserLocation(`${data.address.city}, ${data.address.country}, ${data.address.postcode}`)
                })
                .catch(e => console.log(e))
      }

      const getGeolocation = () => {
          navigator.geolocation.getCurrentPosition((pos) => {
              console.log(pos)
              reverseGeolocate(pos.coords.latitude, pos.coords.longitude)
          })
      }

    const checkKyc = async () => {
        if(!idFile || !isPhotoCaptured || !userLocation){
            alert("Please Upload all required documents")
        }else{
            const det1 = await faceapi.detectSingleFace(idImgRef.current).withFaceLandmarks().withFaceDescriptor()
            
            if(!det1){
                alert("Face not found in ID")
                return
            }
  
            const matcher = new faceapi.FaceMatcher(det1)
        
            const det2 = await faceapi.detectSingleFace(canvasRef.current).withFaceLandmarks().withFaceDescriptor()
        
            if(det2){
                const match = matcher.findBestMatch(det2.descriptor)
                console.log("detections in id = ",det1, det2)
                alert(match.toString())
            }else alert("Face not found in Photo")
        }
    }
    

  return(
    <div className="container">
        <div className="div__id">
            <form action="/file-upload" enctype="multipart/form-data" method="post">
                <input type="file" onChange={changeFile} name="document"/>
                <img ref={idImgRef} src={idFile ? URL.createObjectURL(idFile) : null} width="200" height="200"/>
            </form>
        </div>

        <div className="div__photo">
            <div className="div__photo_child">
                <video className="photo_video" ref={videoRef} width="200" height="200" autoPlay muted></video>
                <canvas className="photo_canvas" ref={canvasRef} width="200" height="200"></canvas>
            </div>
        </div>
        <button onClick={capturePic}>Capture</button>

        <div className="div__location">
            <p>{userLocation}</p>
            <button onClick={getGeolocation}>Locate Me</button>
        </div>
        
        <button onClick={checkKyc}>Verify</button>
    </div>
   )

 }