import React, { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'
import './KYC.css'
import { Alert, Col, Container, Row } from 'react-bootstrap'
import { SuccessKYC } from './SuccessKYC'

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
    const [isKycSuccess, setIsKycSuccess] = useState(false)
    const [showError, setShowError] = useState(false)

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
        if (isVideoOn) {
            console.log("capture")
            canvasRef.current.getContext('2d').drawImage(videoRef.current, 0, 0, 200, 200)
            streamRef.current.getTracks().forEach(track => {
                track.stop()
            });
            setIsPhotoCaptured(true)
        } else {
            navigator.getUserMedia(
                { video: {} },
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
        if (!idFile || !isPhotoCaptured || !userLocation) {
            alert("Please Upload all required documents")
        } else {
            const det1 = await faceapi.detectSingleFace(idImgRef.current).withFaceLandmarks().withFaceDescriptor()

            if (!det1) {
                alert("Face not found in ID")
                return
            }

            const matcher = new faceapi.FaceMatcher(det1)

            const det2 = await faceapi.detectSingleFace(canvasRef.current).withFaceLandmarks().withFaceDescriptor()

            if (det2) {
                const match = matcher.findBestMatch(det2.descriptor)
                // console.log("detections in id = ", det1, det2, " = ", match)
                // alert(match.toString())
                if(match.label !== 'unknown') setIsKycSuccess(true)
                else showKYCError()
            } else alert("Face not found in Photo")
        }
    }


    const showKYCError = () => {
        setShowError(true)
    }


    return (
        <div>{ isKycSuccess ? <SuccessKYC/> : 
            <Container fluid>
                <Row>
                    <Col><h3>Upload ID (jpg/png/jpeg)</h3></Col>
                    <Col><input type="file" onChange={changeFile} name="document" /></Col>
                    <Col><img alt="ID" ref={idImgRef} src={idFile ? URL.createObjectURL(idFile) : null} width="200" height="200" /></Col>
                </Row>
                <br/>
                <Row>
                    <Col><h3>Capture Photo</h3></Col>
                    <Col><button onClick={capturePic}>Capture</button></Col>
                    <Col>
                        <div className="div__photo_child">
                            <video className="photo_video" ref={videoRef} width="200" height="200" autoPlay muted></video>
                            <canvas className="photo_canvas" ref={canvasRef} width="200" height="200"></canvas>
                        </div>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col><h3>Detect your Location</h3></Col>
                    <Col><button onClick={getGeolocation}>Locate Me</button></Col>
                    <Col><input placeholder={userLocation} disabled/></Col>
                </Row>
                <br/>
                <br/>
                <center><button onClick={checkKyc}>Verify</button></center>
                <Row>
                    { showError ? <Col>
                        <Alert variant="danger" onClose={() => setShowError(false)} dismissible>
                        <Alert.Heading>Oh snap! KYC failed</Alert.Heading>
                        <p>
                        The Person in ID does not match with the photo. Try Again! 
                        </p>
                    </Alert>
                    </Col> : null}
                </Row>
            </Container >
        }</div>
        // <div className="container">
        //     <h1>Automatic KYC</h1>
        //     <div className="div__id">
        // <p>Upload ID (jpg/png/jpeg)</p>
        // <form action="/file-upload" enctype="multipart/form-data" method="post">
        //     <input type="file" onChange={changeFile} name="document"/>
        //     <img ref={idImgRef} src={idFile ? URL.createObjectURL(idFile) : null} width="200" height="200"/>
        // </form>
        //     </div>

        //     <div className="div__photo">

        // <p>Capture </p>
        // <div className="div__photo_child">
        //     <video className="photo_video" ref={videoRef} width="200" height="200" autoPlay muted></video>
        //     <canvas className="photo_canvas" ref={canvasRef} width="200" height="200"></canvas>
        // </div>
        //     </div>
        // <button onClick={capturePic}>Capture</button>

        //     <div className="div__location">
        // <p>{userLocation}</p>
        // <button onClick={getGeolocation}>Locate Me</button>
        //     </div>

        //     <button onClick={checkKyc}>Verify</button>
        // </div>
    )

}