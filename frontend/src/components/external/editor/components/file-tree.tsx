//@ts-nocheck
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { Directory, File, sortDir, sortFile } from "../utils/file-manager";
import { getIcon } from "./icon";
import styled from "@emotion/styled";

interface FileTreeProps {
  rootDir: Directory;
  selectedFile: File | undefined;
  onSelect: (file: File) => void;
  newFileOrFolder: boolean;
  setNew: Dispatch<SetStateAction<boolean>>;
  onNew: (name: string) => void;
}

export const FileTree = (props: FileTreeProps) => {
  console.log(props);
  return <SubTree directory={props.rootDir} {...props} />;
};

interface SubTreeProps {
  directory: Directory;
  selectedFile: File | undefined;
  onSelect: (file: File) => void;
  newFileOrFolder: boolean;
  setNew: Dispatch<SetStateAction<boolean>>;
  onNew: (name: string) => void;
}

const SubTree = (props: SubTreeProps) => {
  return (
    <div className="overflow-y-scroll h-screen">
      {props.directory.dirs.sort(sortDir).map((dir) => (
        <React.Fragment key={dir.id}>
          <DirDiv
            directory={dir}
            selectedFile={props.selectedFile}
            onSelect={props.onSelect}
            newFileOrFolder={props.newFileOrFolder}
            setNew={props.setNew}
            onNew={props.onNew}
          />
        </React.Fragment>
      ))}
      {props.directory.files.sort(sortFile).map((file) => (
        <React.Fragment key={file.id}>
          <FileDiv
            file={file}
            selectedFile={props.selectedFile}
            onClick={() => props.onSelect(file)}
            newFileOrFolder={props.newFileOrFolder}
            setNew={props.setNew}
            onNew={props.onNew}
          />
        </React.Fragment>
      ))}
    </div>
  );
};

const FileDiv = ({
  file,
  icon,
  selectedFile,
  onClick,
  newFileOrFolder,
  setNew,
  onNew,
}: {
  file: File | Directory;
  icon?: string;
  selectedFile: File | undefined;
  onClick: () => void;
  newFileOrFolder: boolean;
  setNew: Dispatch<SetStateAction<boolean>>;
  onNew: (name: string) => void;
}) => {
  const isSelected = (selectedFile && selectedFile.id === file.id) as boolean;
  const depth = file.depth;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newFileOrFolder && isSelected) {
      if (inputRef.current === null) return;
      inputRef.current.focus();
    }
  }, [newFileOrFolder, isSelected]);

  const getPaddingClass = (depth: number) => {
    return `pl-${depth * 4}`; // Tailwind uses 4px as base for spacing, adjust accordingly
  };

  return (
    <div className="overflow-auto">
      <Div depth={depth} isSelected={isSelected} onClick={onClick}>
        <FileIcon name={icon} extension={file.name.split(".").pop() || ""} />
        <span style={{ marginLeft: 1 }}>{file.name}</span>
      </Div>
      {newFileOrFolder && isSelected && (
        <div className={`mt-2 ${getPaddingClass(depth)}`}>
          <input
            className={`text-black bg-white p-1 border border-gray-300 rounded-md w-full max-w-xs`}
            ref={inputRef}
            placeholder="Enter Name"
            onBlur={() => {
              setNew(false);
              onNew(inputRef.current?.value || "");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setNew(false);
                onNew(inputRef.current?.value || "");
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

const Div = styled.div<{
  depth: number;
  isSelected: boolean;
}>`
  display: flex;
  align-items: center;
  padding-left: ${(props) => props.depth * 16}px;
  background-color: ${(props) =>
    props.isSelected ? "#242424" : "transparent"};

  :hover {
    cursor: pointer;
    background-color: #242424;
  }
`;

const DirDiv = ({
  directory,
  selectedFile,
  onSelect,
  newFileOrFolder,
  setNew,
  onNew,
}: {
  directory: Directory;
  selectedFile: File | undefined;
  onSelect: (file: File) => void;
  newFileOrFolder: boolean;
  setNew: Dispatch<SetStateAction<boolean>>;
  onNew: (name: string) => void;
}) => {
  let defaultOpen = false;
  if (selectedFile) defaultOpen = isChildSelected(directory, selectedFile);
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <FileDiv
        file={directory}
        icon={open ? "openDirectory" : "closedDirectory"}
        selectedFile={selectedFile}
        onClick={() => {
          if (!open) {
            onSelect(directory);
          }
          setOpen(!open);
        }}
        newFileOrFolder={newFileOrFolder}
        setNew={setNew}
        onNew={onNew}
      />
      {open ? (
        <SubTree
          directory={directory}
          selectedFile={selectedFile}
          onSelect={onSelect}
          newFileOrFolder={newFileOrFolder}
          setNew={setNew}
          onNew={onNew}
        />
      ) : null}
    </>
  );
};

const isChildSelected = (directory: Directory, selectedFile: File) => {
  let res: boolean = false;

  function isChild(dir: Directory, file: File) {
    if (selectedFile.parentId === dir.id) {
      res = true;
      return;
    }
    if (selectedFile.parentId === "0") {
      res = false;
      return;
    }
    dir.dirs.forEach((item) => {
      isChild(item, file);
    });
  }

  isChild(directory, selectedFile);
  return res;
};

const FileIcon = ({
  extension,
  name,
}: {
  name?: string;
  extension?: string;
}) => {
  let icon = getIcon(extension || "", name || "");
  return <Span>{icon}</Span>;
};

const Span = styled.span`
  display: flex;
  width: 32px;
  height: 32px;
  justify-content: center;
  align-items: center;
`;
