'use client'

import { jwtDecode } from "jwt-decode"
import styles from "./page.module.css"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const Home = () => {
  const router = useRouter()
  const [fadeClass, setFadeClass] = useState('fade-wrapper')
  const [username, setUsername] = useState("")
  const [gName, setGName] = useState("")
  const [gcode, setGCode] = useState("")
  const [loading, setLoading] = useState(false)

  const getToken = () => {
    const token = localStorage.getItem("ttrek_token")
    if (token) {
      const decoded = jwtDecode(token)
      setUsername(decoded.username)
    }
  }

  useEffect(() => {
    getToken()
  }, [])

  useEffect(() => {
    if (username.trim() !== "") {
      setFadeClass('fade-wrapper fade-in')
    } else {
      setFadeClass('fade-wrapper fade-in')
    }
  }, [username])

  const handleRedirect = (path) => {
    setFadeClass('fade-wrapper fade-out')
    setTimeout(() => {
      if (path === "") {
        window.location.href = "/"
      } else {
        router.push(`/${path}`)
      }
    }, 500);
  };

  const handleJoinGame = async () => {
    setLoading(true)
    if (username) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BURL}/join-game`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ gName, gcode, username, team: "" })
        })
        const data = await response.json()
        if (data.message === "Joined") {
          setFadeClass('fade-wrapper fade-out')
          setTimeout(() => {
            router.push(`/game/${data.id}`)
          }, 500);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setGCode("")
        setGName("")
        setLoading(false)
      }
    } else {
      handleRedirect("login")
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.navbar}>
        <div className={styles.logo}>
          <h1 onClick={() => { handleRedirect("") }}>Treasure Trek</h1>
        </div>
        <div className={`${styles.navlinks} ${styles[fadeClass.split(' ')[0]]} ${styles[fadeClass.split(' ')[1]]}`}>
          {username ? (
            <>
              <a onClick={() => { handleRedirect('my-games') }}>My Games</a>
              <a onClick={() => { handleRedirect('account') }}>{username}</a>
            </>
          ) : (
            <>
              <a onClick={() => { handleRedirect("login") }}>Login</a>
            </>
          )}
        </div>
      </div>

      <div className={`${styles.container} ${styles[fadeClass.split(' ')[0]]} ${styles[fadeClass.split(' ')[1]]}`}>
        <h1 className={styles.welcomeMessage}>{username.trim() === "" ? `Ready for the Adventure?` : `Ready for the Adventure, ${username}?`}</h1>
        <div style={{ width: "200px", display: "flex", flexDirection: "column", alignItems: 'center' }}>
          <button className={styles.gamebtn} onClick={() => { handleRedirect('new-game') }}>Host New Game</button>

          <div className={styles.divider}>
            <span>OR</span>
          </div>
          <input type="text" className={styles.input} placeholder="Enter Game Name..." value={gName} onChange={(e) => { setGName(e.target.value) }} />
          <input type="text" className={styles.input} placeholder="Enter Game Code..." value={gcode} onChange={(e) => { setGCode(e.target.value) }} />
          <button className={styles.gamebtn} onClick={handleJoinGame} disabled={gName.trim() === "" || gcode.trim() === "" || loading}>Join a Game</button>
        </div>
        <div className={{ marginTop: "100px" }}>
          <span style={{ color: "#f7fff8" }}>Adventure</span>
        </div>
      </div>
    </div>
  )
}

export default Home;