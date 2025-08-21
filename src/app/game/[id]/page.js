'use client'

import { useParams, useRouter } from "next/navigation";
import styles from './game.module.css'
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";

const Game = () => {
    const { id } = useParams()
    const router = useRouter()
    const [fadeClass, setFadeClass] = useState('fade-wrapper')
    const [username, setUsername] = useState("")
    const [gameData, setGameData] = useState(null)
    const [objname, setObjname] = useState("")
    const [objid, setObjid] = useState("")
    const [lat, setLat] = useState("")
    const [long, setLong] = useState("")
    const [points, setPoints] = useState(0)
    const [objPd, setObjPd] = useState("")
    const [gameObjects, setGameObjects] = useState([])
    const [gameParticipants, setGameParticipants] = useState([])
    const [selectedObjectId, setSelectedObjectId] = useState("")
    const [selectedObject, setSelectedObject] = useState()
    const [userData, setUserData] = useState()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const gameId = id;

        const socket = io(`${process.env.NEXT_PUBLIC_BURL}`, {
            withCredentials: true, // optional, only if your server expects it
        });

        socket.on('connect', () => {
            console.log('✅ Connected to socket:', socket.id);
            socket.emit('joinGame', gameId);
        });

        socket.on('participants-updated', (updatedParticipants) => {
            setGameParticipants(updatedParticipants);
        });

        socket.on('game-started', (gamestatus) => {
            setFadeClass('fade-wrapper fade-out');
            setTimeout(() => {
                setFadeClass('fade-wrapper fade-in');
                setGameData(prev => ({
                    ...prev,
                    status: gamestatus,
                }));
            }, 500);
            if (gamestatus === "completed") {
                getGameData();
            }
        });

        socket.on('found-object-update', (gameObj) => {
            setGameObjects(gameObj);
        });

        return () => {
            socket.emit('leaveGame', gameId);
            socket.disconnect();
        };
    }, []);


    const getToken = () => {
        const token = localStorage.getItem("ttrek_token")
        if (token) {
            const decoded = jwtDecode(token)
            setUsername(decoded.username)
        } else {
            router.push("/")
        }
    }

    const getGameData = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BURL}/get-game-data`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id })
        })
        const data = await response.json()
        setGameData(data.game)
        setGameObjects(data.game.gameObjects)
        setGameParticipants(data.game.participants)
    }

    useEffect(() => {
        getToken()
        if (username.trim() !== "") {
            getGameData()
        }
    }, [username])

    useEffect(() => {
        if (gameData) {
            setFadeClass('fade-wrapper fade-in')
        }
    }, [gameData])

    useEffect(() => {
        if (selectedObjectId) {
            const object = gameObjects.find(obj => obj._id === selectedObjectId)
            setSelectedObject(object)
        }
    }, [selectedObjectId])

    const handleAddObject = async () => {
        if (!objname || !objid || !lat || !long || !points || !objPd) {
            alert("All fields are required.")
            return;
        }
        setLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BURL}/add-game-object`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ objname, objid, lat, long, points, objPd, gameId: id })
            })
            const data = await response.json()

            if (data.success === true) {
                const gameobj = {
                    _id: data.id,
                    objectName: objname,
                    objectId: objid,
                    latitude: lat,
                    longitude: long,
                    objectPoints: points,
                    objectPd: objPd
                }
                setGameObjects(prev => [...prev, gameobj])
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
            setObjname("")
            setObjid("")
            setLat("")
            setLong("")
            setPoints(0)
            setObjPd("")
        }
    }

    const handleRemove = async (objid) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BURL}/remove-game-object`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: id, objid })
        })
        const data = await response.json()

        if (data.success === true) {
            setGameObjects(prev => prev.filter(gid => gid._id !== objid))
        }
    }

    const handleHostGame = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BURL}/host-game`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id })
        })
        const data = await response.json()
        if (data.success === true) {
            setFadeClass('fade-wrapper fade-out')
            setTimeout(() => {
                setGameData(prev => ({
                    ...prev,
                    status: "hosted"
                }))
                setFadeClass('fade-wrapper fade-in')
            }, 500)
        }
    }

    const handleStartGame = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BURL}/start-game`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id })
        })
        const data = await response.json()
        if (data.success === true) {
            setFadeClass('fade-wrapper fade-out')
            setTimeout(() => {
                setFadeClass('fade-wrapper fade-in')
                setGameData(prev => ({
                    ...prev,
                    status: "started"
                }))
            }, 500)
        }
    }

    const handleRemoveParticipant = async (participantId) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BURL}/remove-participant`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ gameId: id, pid: participantId })
        })
        const data = await response.json()
        if (data.success === true) {
            setGameParticipants(prev => prev.filter(p => p._id !== participantId))
        }
    }

    const handleFindObjectClick = (id) => {
        setSelectedObjectId(id)
    }

    const handleFound = async (oid, points) => {
        if (gameData.host_username === username) {
            alert('You can only spectate as a host, let the participants find the objects.')
            return
        }
        if (username.trim() === "") {
            alert('You can only spectate, to participate in the game, login and join the game from home page.')
            return
        }
        if (!gameData.participants.find(p => p.pname === username)) {
            alert('You can only spectate as you are not a participant, to participate in the game, join the game from home page.')
            return
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_BURL}/found-object`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ gameId: id, objectId: oid, username, points })
        })
        const data = await response.json();
        if (data.message === "Object status updated, points awarded, and participant found objects updated") {
            setGameObjects(data.game.gameObjects)
            setUserData(data.user)
        }
    }

    const handleRedirect = (path) => {
        setFadeClass('fade-wrapper fade-out')
        setTimeout(() => {
            router.push(`/${path}`)
        }, 500);
    };

    return (
        <div className={styles.page}>
            <div className={styles.navbar}>
                <div className={styles.logo}>
                    <h1 onClick={() => { handleRedirect('') }}>Treasure Trek</h1>
                </div>
                <div className={`${styles.navlinks} ${styles[fadeClass.split(' ')[0]]} ${styles[fadeClass.split(' ')[1]]}`}>
                    <a onClick={() => { handleRedirect('my-games') }}>My Games</a>
                    <a onClick={() => { handleRedirect('account') }}>{username}</a>
                </div>
            </div>
            {gameData && (gameData.status === "preparing" && gameData.host_username === username) && (
                <div className={`${styles.container} ${styles[fadeClass.split(' ')[0]]} ${styles[fadeClass.split(' ')[1]]}`}>
                    <h1>{gameData.gameName}</h1>
                    <div>
                        <p>Game Mode: {gameData.gameMode}</p>
                    </div>
                    <button className={styles.sgbtn} disabled={gameObjects.length === 0} onClick={handleHostGame}>Host the Game</button>
                    {gameObjects.length > 0 && (
                        <div>
                            <h2 style={{ marginTop: 10 }}>Current Objects:</h2>
                            <div className={styles.addContainer}>
                                {gameObjects.map((obj, index) => {
                                    return (
                                        <div className={styles.currentObjectContainer} key={index}>
                                            <button className={styles.deleteBtn} onClick={() => { handleRemove(obj._id) }}>Remove</button>
                                            <p style={{ marginBottom: 15, fontSize: "1.1rem" }}><u style={{ textDecorationThickness: 2, textUnderlineOffset: 4 }}>{obj.objectName}</u></p>
                                            <p>Id: {obj.objectId}</p>
                                            <p>Points: {obj.objectPoints}</p>
                                            <p>Coordinates: {obj.latitude}, {obj.longitude}</p>
                                            <p>Place Description: {obj.objectPd}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                    <div>
                        <h2 style={{ marginTop: 10 }}>Add objects to the game:</h2>
                        <div className={styles.addContainer}>
                            <div className={styles.objid}>
                                <p>Object:</p>
                                <input type="text" placeholder="eg: Yellow ball" value={objname} onChange={(e) => { setObjname(e.target.value) }} />
                            </div>
                            <div className={styles.objid} style={{ marginTop: 15 }}>
                                <p>Object Id:</p>
                                <input type="text" placeholder="eg: OBJ001" value={objid} onChange={(e) => { setObjid(e.target.value) }} />
                            </div>
                            <div className={styles.coordinates}>
                                <div>
                                    <p>Latitude:</p>
                                    <input type="text" placeholder="eg: 37.7749" value={lat} onChange={(e) => { setLat(e.target.value) }} />
                                </div>
                                <div>
                                    <p>Longitude:</p>
                                    <input type="text" placeholder="eg: -122.4194" value={long} onChange={(e) => { setLong(e.target.value) }} />
                                </div>
                            </div>
                            <div className={styles.pointsdiv}>
                                <p>Object Points:</p>
                                <input type='number' placeholder="eg: 2" value={points} onChange={(e) => { setPoints(e.target.value) }} />
                            </div>
                            {/* <div className={styles.objimg}>
                                <p>Object Image:</p>
                                <input type="file" />
                            </div> */}
                            <div className={styles.placementDiv}>
                                <p>Place Description:</p>
                                <textarea placeholder="eg: in the right corner of the garden" rows={3} value={objPd} onChange={(e) => { setObjPd(e.target.value) }} />
                            </div>
                            <button className={styles.addobjbutton} onClick={handleAddObject} disabled={loading}>Add Object</button>
                        </div>
                    </div>
                </div>
            )}
            {gameData && (gameData.status === "hosted" || (gameData.status === "preparing" && gameData.host_username !== username)) && (
                <div className={`${styles.container} ${styles[fadeClass.split(' ')[0]]} ${styles[fadeClass.split(' ')[1]]}`}>
                    <h1>{gameData.gameName}</h1>
                    <h2 style={{ fontSize: "1rem" }}>Game Code: {gameData.gameCode}</h2>
                    <div className={styles.participantsContainer}>
                        <h3>Participants: {gameParticipants.length}</h3>
                        {gameParticipants && gameParticipants.map((participant, index) => {
                            return (
                                <div className={styles.participant} key={index}>
                                    <div style={{ display: "flex", flexDirection: "row", alignItems: 'center', gap: 10 }}>
                                        <div className={styles.profilePic}>{participant.pname[0].toUpperCase()}</div>
                                        <p>{participant.pname}</p>
                                    </div>
                                    {gameData.host_username === username && participant.pname !== username && (
                                        <button onClick={() => { handleRemoveParticipant(participant._id) }}>Kick</button>
                                    )}
                                    {participant.pname === username && (
                                        <button onClick={() => { handleRemoveParticipant(participant._id) }}>Leave</button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <button className={styles.startgameBtn} disabled={gameParticipants.length === 0 || gameData.host_username !== username} onClick={handleStartGame}>{gameData.host_username === username ? "Start the Game" : "Wait for the host to start the game."}</button>
                </div>
            )}
            {gameData && gameData.status === "started" && (
                <div className={`${styles.container2} ${styles[fadeClass.split(' ')[0]]} ${styles[fadeClass.split(' ')[1]]}`}>
                    <div className={styles.leftSection}>
                        <h1 className={styles.adventureText}>The adventure begins.</h1>
                        <h2 className={styles.gameNameText}>{gameData.gameName}</h2>
                        <div className={styles.divider}></div>
                        {gameObjects && gameObjects.filter(obj => obj.status?.split(" ")[0] !== "found").length > 0 && (
                            <h2 className={styles.findText} style={{ marginBottom: 10 }}>Objects to Find.</h2>
                        )}
                        {gameObjects && gameObjects.filter(obj => obj.status?.split(" ")[0] !== "found").map((object, index) => {
                            return (
                                <div className={styles.objfindContainer} key={index} onClick={() => { handleFindObjectClick(object._id) }} style={{ backgroundColor: selectedObjectId === object._id ? "#203430" : "#dce6dc" }}>
                                    <h1 className={styles.objFindHead} style={{ color: selectedObjectId === object._id ? "#f7fff8" : "#203430" }}>{object.objectId}</h1>
                                    <h1 className={styles.objFindPoints} style={{ color: selectedObjectId === object._id ? "#f7fff8" : "#203430" }}>Points: {object.objectPoints}</h1>
                                    {object.status && object.status.split(" ")[0] === "found" && (
                                        <p className={styles.foundbytext} style={{ color: selectedObjectId === object._id ? "#dce6dc" : "#203430" }}>Found by {object.status.split(" ")[2]}</p>
                                    )}
                                </div>
                            )
                        })}
                        {gameObjects && gameObjects.filter(obj => obj.status?.split(" ")[0] === "found").length > 0 && (
                            <h2 className={styles.findText} style={{ marginTop: 10 }}>Found Objects.</h2>
                        )}
                        {gameObjects && gameObjects.filter(obj => obj.status?.split(" ")[0] === "found").map((object, index) => {
                            return (
                                <div className={styles.objfoundContainer} key={index} style={{ backgroundColor: selectedObjectId === object._id ? "#203430" : "#dce6dc" }}>
                                    <h1 className={styles.objFindHead} style={{ color: selectedObjectId === object._id ? "#f7fff8" : "#203430" }}>{object.objectId}</h1>
                                    <h1 className={styles.objFindPoints} style={{ color: selectedObjectId === object._id ? "#f7fff8" : "#203430" }}>Points: {object.objectPoints}</h1>
                                    {object.status && object.status.split(" ")[0] === "found" && (
                                        <p className={styles.foundbytext} style={{ color: selectedObjectId === object._id ? "#dce6dc" : "#203430" }}>Found by {object.status.split(" ")[2]}</p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <div className={styles.rightSection}>
                        {gameParticipants && gameParticipants.find(p => p.pname === username) && (
                            <h1>Points: {gameParticipants.find(p => p.pname === username).ppoints}</h1>
                        )}
                        {selectedObject ? (
                            <div>
                                <div>
                                    <h1>{selectedObject.objectId}</h1>
                                </div>
                                <h2 style={{ marginTop: 25 }}>Object Riddle</h2>
                                <p>{selectedObject.objectRiddle}</p>
                                <h2 style={{ marginTop: 25 }}>Place Riddle</h2>
                                <p>{selectedObject.placeRiddle}</p>
                                <button className={styles.foundBtn} onClick={() => { handleFound(selectedObject._id, selectedObject.objectPoints) }}>Found</button>
                            </div>
                        ) : (
                            <h1>Select an Object</h1>
                        )}
                    </div>
                </div>
            )}
            {gameData && gameData.status === "completed" && (
                <div className={`${styles.container} ${styles[fadeClass.split(' ')[0]]} ${styles[fadeClass.split(' ')[1]]}`}>
                    <h1>Game Finished</h1>
                    <h2>Leaderboard</h2>
                    <div style={{ backgroundColor: "#dce6dc", padding: 20, borderRadius: 15, display: 'flex', flexDirection: "column", gap: 10, marginTop: 10 }}>
                        {gameData.participants.sort((a, b) => b.ppoints - a.ppoints).map((p, index) => {
                            return (
                                <div key={index} style={{ backgroundColor: "#e7f3e8", padding: 15, borderRadius: 15, display: 'flex', flexDirection: "row", alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', flexDirection: "row", alignItems: 'center', gap: 10 }}>
                                        <h2 style={{ fontSize: "1.1rem", margin: 0 }}>#{index + 1}</h2>
                                        <div className={styles.profilePic}>{p.pname[0].toUpperCase()}</div>
                                        <h2 style={{ fontSize: "1rem", margin: 0 }}>{p.pname}</h2>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: "center", gap: 10 }}>
                                        <div style={{ display: "flex", flexDirection: 'column', alignItems: 'center' }}>
                                            <h2 style={{ fontSize: "0.8rem", margin: 0, textAlign: 'center', marginBottom: 5 }}>Objects Found</h2>
                                            <h2 style={{ fontSize: "1rem", margin: 0 }}>{p.objFound.length}</h2>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: "100%" }}>
                                            <h2 style={{ fontSize: "0.8rem", margin: 0, textAlign: 'center', marginBottom: 5 }}>Points</h2>
                                            <h2 style={{ fontSize: "1rem", margin: 0 }}>{p.ppoints}</h2>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Game;