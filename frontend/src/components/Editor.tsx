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
      const readme = rootDir.files.filter(
        (file) => file.name.toLowerCase() === "readme.md",
      );
      if (readme.length !== 0) onSelect(readme[0]);
      else onSelect(rootDir.files[0]);
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
            <div className="flex justify-between items-center bg-gray-700 p-1 rounded w-full">
              <div className="font-bold text-white-700">Workspace</div>
              <div className="flex space-x-2">
                <button
                  className="m-1 text-blue-500 hover:text-blue-600 cursor-pointer text-sm p-1.5 bg-gray-500 rounded relative group"
                  onClick={() => {
                    setNewFileOrFolder(true);
                    setNewType("file");
                  }}
                >
                  <FontAwesomeIcon icon={faFileAlt} className="text-xl" />
                  <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 p-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100">
                    New File
                  </span>
                </button>

                <div
                  className="m-1 text-blue-500 hover:text-blue-600 cursor-pointer text-sm p-1.5 bg-gray-500 rounded relative group"
                  onClick={() => {
                    setNewFileOrFolder(true);
                    setNewType("folder");
                  }}
                >
                  <FontAwesomeIcon icon={faFolder} className="text-xl" />
                  <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 p-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100">
                    New Folder
                  </span>
                </div>
              </div>
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
        <div className="w-full flex flex-col">
          <div className="bg-slate-600 w-36 inline-block text-center">{selectedFile?.name}</div>
          <Code socket={socket} selectedFile={selectedFile} />
        </div>
      </Main>
    </div>
  );
};

const Main = styled.main`
  display: flex;
`;
