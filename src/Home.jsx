import React, { useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [currentServer, setCurrentServer] = useState(0);
  const navigate = useNavigate();


  return (
    <div className="homepage">
      <h2>Who would you like to be served by today?</h2>
    <div className="server-wrapper">
      <button
        className="server-btn left"
        onClick={() => setCurrentServer(currentServer === 0 ? 3 : currentServer - 1)}
      >◀</button>

      <div className="serverpage">
          <div className="server-container">
                {/* Server 1 */}
          {currentServer === 0 && (
            <div className="cradles">
              <h3>Cradles</h3>
              <p>
                ‣ Loves Matcha  <br />
                ‣ Your go-to personal therapist  <br />
                ‣ Top-Tier Barist & #1 Buddy  <br />
                ‣ Performative final boss <br />
                ‣ Runs Misty Plaza Cafe
              </p>
              <button
                    className="pick-btn"
                    onClick={() => navigate("/cradles", { replace: true })}
                  >
                    Pick Cradles
                  </button>
 

            </div>
          )}

          {/* Server 2 */}
          {currentServer === 1 && (
            <div className="mae">
              <h3>Mae</h3>
              <p>
                ‣ Fruit Juice Kinda-Gal  <br />
                ‣ Spills lots of tea and loves stories <br />
                ‣ Fruit Ninja is her favorite game  <br />
                ‣ LOVES T.V. Shows <br />
                ‣ Runs Elixir Juice Bar
              </p>
               <button
                  className="pick-btn1"
                  onClick={() => navigate("/mae", { replace: true })}
                >
                  Pick Mae
                </button>
            </div>
          )}

          {/* Server 3 */}
          {currentServer === 2 && (
            <div className="skye">
              <h3>Skye</h3>
              <p>
                ‣ Travels a Lot  <br />
                ‣ Big Empath and Emotional <br />
                ‣ Anyone want Pina Coladas? Or just me?  <br />
                ‣ Sun-bathing and tan-lines are everything to me. <br />
                ‣ Runs Skylight Tower Bar
              </p>
               <button
                  className="pick-btn2"
                  onClick={() => navigate("/skye", { replace: true })}
                >
                  Pick Skye
                </button>
            </div>
          )}

          {/* Server 4 */}
          {currentServer === 3 && (
            <div className="prince">
              <h3>prince</h3>
              <p>
                ‣ A Hopeless-Romantic  <br />
                ‣ Loves cappucinos <br />
                ‣ Cries over sentimental movies  <br />
                ‣ Will you give me a chance? <br />
                ‣ Runs Velvet Petal Cafe
              </p>
               <button
                  className="pick-btn3"
                  onClick={() => navigate("/prince", { replace: true })}
                >
                  Pick Prince
                </button>
            </div>
          )}
        </div>
      </div>

      <button
        className="server-btn left"
        onClick={() =>
          setCurrentServer(currentServer === 0 ? 3 : currentServer - 1)
        }
      >
        ◀
      </button>

      <button
        className="server-btn right"
        onClick={() =>
          setCurrentServer(currentServer === 3 ? 0 : currentServer + 1)
        }
      >
        ▶
      </button>

     
      <button
        className="server-btn right"
        onClick={() => setCurrentServer(currentServer === 3 ? 0 : currentServer + 1)}
      >▶</button>
    </div>

    </div>
  );
}
