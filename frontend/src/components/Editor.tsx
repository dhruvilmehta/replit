//@ts-nocheck
import { useEffect, useMemo, useState } from "react";
import Sidebar from "./external/editor/components/sidebar";
import { Code } from "./external/editor/editor/code";
import styled from "@emotion/styled";
import {
  File,
  buildFileTree,
  RemoteFile,
} from "./external/editor/utils/file-manager";
import { FileTree } from "./external/editor/components/file-tree";
import { Socket } from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faFolder } from "@fortawesome/free-solid-svg-icons";

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end; /* Aligns children (button) to the right */
  padding: 10px; /* Adds some space around the button */
`;

// credits - https://codesandbox.io/s/monaco-tree-pec7u
export const Editor = ({
  files,
  onSelect,
  selectedFile,
  socket,
  onNewFile,
  onNewFolder,
}: {
  files: RemoteFile[];
  onSelect: (file: File) => void;
  selectedFile: File | undefined;
  socket: Socket;
  onNewFile: (name: string) => void;
  onNewFolder: (name: string) => void;
}) => {
  const rootDir = useMemo(() => {
    return buildFileTree(files);
  }, [files]);

  const [newType, setNewType] = useState<string>("");
  const [newFileOrFolder, setNewFileOrFolder] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedFile) {
      onSelect(rootDir.files[0]);
    }
  }, [selectedFile]);

  const onNew = (name: string) => {
    console.log(name, "New file name");
    if (name === "") return;
    if (newType === "file") onNewFile(name);
    else onNewFolder(name);
  };

  return (
    <div>
      <Main>
        <Sidebar>
          <ButtonContainer>
            {/* <button onClick={()=>onNewFile(newFileName)}>New File</button>
            <button onClick={()=>onNewFolder(newFileName)}>New Folder</button> */}
            <button
              className="m-1 text-blue-500 hover:text-blue-600 cursor-pointer text-sm p-1.5"
              onClick={() => {
                setNewFileOrFolder(true);
                setNewType("file");
              }}
            >
              <FontAwesomeIcon icon={faFileAlt} className="text-xl" />
            </button>

            <div
              className="m-1 text-blue-500 hover:text-blue-600 cursor-pointer text-sm p-1.5"
              onClick={() => {
                setNewFileOrFolder(true);
                setNewType("folder");
              }}
            >
              {/* <FontAwesomeIcon icon={faFolder} /> */}
              <FontAwesomeIcon icon={faFolder} className="text-xl" />
            </div>
            {/* <button onClick={()=>setNewFolder(true)}>New Folder</button> */}
          </ButtonContainer>
          <FileTree
            rootDir={rootDir}
            selectedFile={selectedFile}
            onSelect={onSelect}
            newFileOrFolder={newFileOrFolder}
            setNew={setNewFileOrFolder}
            onNew={onNew}
          />
          {/* <input placeholder="Enter Name" onChange={(e)=>setNewFileName(e.target.value)}></input> */}
        </Sidebar>
        <Code socket={socket} selectedFile={selectedFile} />
      </Main>
    </div>
  );
};

const Main = styled.main`
  display: flex;
`;
