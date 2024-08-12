// @ts-nocheck
import { useEffect, useState, useRef } from "react";
import { Socket, io } from "socket.io-client";
import { Editor } from "./Editor";
import { File, RemoteFile, Type } from "./external/editor/utils/file-manager";
import { useSearchParams } from "react-router-dom";
import styled from "@emotion/styled";
import { Output } from "./Output";
import { TerminalComponent as Terminal } from "./Terminal";
import axios from "axios";

function useSocket(replId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(`wss://${replId}.socket.replit.dhruvilspace.site`);
    setSocket(newSocket);

    return () => {
      console.log("Disconnecting");
      newSocket.disconnect();
    };
  }, [replId]);

  return socket;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  color: white;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end; /* Aligns children (button) to the right */
  padding: 10px; /* Adds some space around the button */
  color: white back;
`;

const Workspace = styled.div`
  display: flex;
  margin: 0;
  font-size: 16px;
  width: 100%;
`;

const LeftPanel = styled.div`
  flex: 1;
  width: 60%;
`;

const RightPanel = styled.div`
  flex: 1;
  width: 40%;
`;

// const SERVICE_URL = "/backend";
// const SERVICE_URL = "https://replit.dhruvilspace.site";
// const SERVICE_URL = "http://localhost:3001";
// const SERVICE_URL = "http://54.242.174.57";
const SERVICE_URL = "https://replitbackend.dhruvilspace.site";

export const CodingPage = () => {
  const [podCreated, setPodCreated] = useState(false);
  const [searchParams] = useSearchParams();
  const replId = searchParams.get("replId") ?? "";

  useEffect(() => {
    if (replId) {
      axios
        .post(`${SERVICE_URL}/service/start`, {
          replId,
          token: localStorage.getItem("token"),
        })
        .then(() => setPodCreated(true))
        .catch((err) => console.error(err));
    }
  }, []);

  if (!podCreated) {
    return <>Booting...</>;
  }
  return <CodingPagePostPodCreation />;
};

export const CodingPagePostPodCreation = () => {
  const [searchParams] = useSearchParams();
  const replId = searchParams.get("replId") ?? "";
  const [loaded, setLoaded] = useState(false);
  const socket = useSocket(replId);
  const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [showOutput, setShowOutput] = useState(false);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (socket) {
      console.log("Socket loaded");
      socket.on("loaded", ({ rootContent }: { rootContent: RemoteFile[] }) => {
        setLoaded(true);
        setFileStructure(rootContent);
        console.log(rootContent, " RootContent");
      });
    }
  }, [socket]);

  const onSelect = (file: File) => {
    console.log("OnSelect", file);
    if (file.type === Type.DIRECTORY) {
      socket?.emit("fetchDir", file.path, (data: RemoteFile[]) => {
        setFileStructure((prev) => {
          const allFiles = [...prev, ...data];
          return allFiles.filter(
            (file, index, self) =>
              index === self.findIndex((f) => f.path === file.path),
          );
        });
      });
      setSelectedFile(file);
    } else {
      socket?.emit("fetchContent", { path: file.path }, (data: string) => {
        file.content = data;
        setSelectedFile(file);
      });
    }
  };

  const onNewFile = (name: string) => {
    console.log("New File", selectedFile);
    let fileString;
    if (selectedFile?.type === Type.DIRECTORY) {
      fileString = `${selectedFile?.id}`;
    } else {
      fileString = `${
        selectedFile?.parentId !== "0" ? selectedFile?.parentId : ""
      }`;
    }
    console.log(fileString);
    socket?.emit("newFile", { path: fileString, name: name });
    socket?.emit("fetchDir", fileString, (data: RemoteFile[]) => {
      setFileStructure((prev) => {
        const allFiles = [...prev, ...data];
        return allFiles.filter(
          (file, index, self) =>
            index === self.findIndex((f) => f.path === file.path),
        );
      });
    });
  };

  const onNewFolder = (name: string) => {
    let fileString;
    if (selectedFile?.type === Type.DIRECTORY) {
      fileString = `${selectedFile?.id}`;
    } else {
      fileString = `${
        selectedFile?.parentId !== "0" ? selectedFile?.parentId : ""
      }`;
    }
    socket?.emit("newFolder", { path: fileString, name: name });
    socket?.emit("fetchDir", fileString, (data: RemoteFile[]) => {
      setFileStructure((prev) => {
        const allFiles = [...prev, ...data];
        return allFiles.filter(
          (file, index, self) =>
            index === self.findIndex((f) => f.path === file.path),
        );
      });
    });
  };

  useEffect(() => {
    // Refocus terminal when showOutput changes to true
    if (showOutput && terminalRef.current) {
      terminalRef.current.focus();
    }
  }, [showOutput]);

  const [panelWidth, setLeftPanelWidth] = useState(60);

  if (!loaded) {
    return "Loading...";
  }
  if (!socket) return;

  console.log(panelWidth, "Panel width");

  return (
    <Container>
      <div className="mb-4 flex justify-between items-center">
        <div className="text-left">
          For more details regarding how to run the code, view the Readme.md
          file.
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowOutput(!showOutput)}
            className="m-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            See output
          </button>
          <a
            className="m-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            href={`https://${replId}.replit.dhruvilspace.site`}
            target="_blank"
            rel="noreferrer"
          >
            See Output on New Tab
          </a>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        <div
          className="flex-shrink-0"
          style={{ width: `60%` }} // Setting LeftPanel width to 60%
        >
          <Editor
            socket={socket}
            selectedFile={selectedFile}
            onSelect={onSelect}
            onNewFile={onNewFile}
            onNewFolder={onNewFolder}
            files={fileStructure}
          />
        </div>
        {/* <div
          className="resize-handle"
          style={{ width: "10px", cursor: "col-resize" }}
        ></div> */}
        <div
          className="flex-grow"
          style={{ width: `40%` }} // Setting RightPanel width to 40%
        >
          {showOutput && <Output />}
          <Terminal socket={socket} ref={terminalRef} />
        </div>
      </div>
    </Container>
  );
};
