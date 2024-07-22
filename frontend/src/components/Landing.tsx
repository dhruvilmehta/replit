/** Import necessary libraries */
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";

/** Constants */
const SLUG_WORKS = [
  "car",
  "dog",
  "computer",
  "person",
  "inside",
  "word",
  "for",
  "please",
  "to",
  "cool",
  "open",
  "source",
];
const SERVICE_URL = "/backend";

/** Styled components */
const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  color: white;
`;

const StyledInput = styled.input`
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const StyledSelect = styled.select`
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const StyledButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

/** Helper function */
function getRandomSlug() {
  let slug = "";
  for (let i = 0; i < 3; i++) {
    slug += SLUG_WORKS[Math.floor(Math.random() * SLUG_WORKS.length)];
  }
  return slug;
}

/** Component */
export const Landing = () => {
  const [language, setLanguage] = useState("node-js");
  const [replId, setReplId] = useState(getRandomSlug());
  const [loading, setLoading] = useState(false);
  const [repls, setRepls] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token") === null) navigate("/login");
    axios
      .get(`${SERVICE_URL}/getRepls`, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setRepls(response.data);
      });
  }, []);

  return (
    <div>
      <Container>
        <Title>Lepl lit</Title>
        <StyledInput
          onChange={(e) => setReplId(e.target.value)}
          type="text"
          placeholder="Repl ID"
          value={replId}
        />
        <StyledSelect
          name="language"
          id="language"
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="node-js">Node.js</option>
          <option value="python">Python</option>
        </StyledSelect>
        <StyledButton
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            let response = await axios.post(`${SERVICE_URL}/init/project`, {
              replId,
              language,
              token: localStorage.getItem("token"),
            });
            if (response.status === 400) navigate("/login");
            else if (response.status === 404) alert("User not found");
            else if (response.status === 409) alert("Repl already exists");
            else {
              setLoading(false);
              navigate(`/coding/?replId=${replId}`);
            }
          }}
        >
          {loading ? "Starting ..." : "Start Coding"}
        </StyledButton>
      </Container>
      <div className="text-white border p-4 bg-gray-800">
        <h2 className="text-xl font-bold mb-4">Existing Repls</h2>
        <div className="flex flex-wrap gap-4">
          {repls.length !== 0
            ? repls.map((repl) => (
                <div className="flex-1 min-w-[150px] bg-gray-700 p-4 rounded-lg">
                  <button
                    className="text-white"
                    onClick={() => navigate(`/coding/?replId=${repl}`)}
                  >
                    {repl}
                  </button>
                </div>
              ))
            : "No Existing repls found!!"}
        </div>
      </div>
    </div>
  );
};
