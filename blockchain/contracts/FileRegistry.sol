pragma solidity ^0.8.20;

contract FileRegistry {
    struct File {
        string ipfsHash;
        string name;
        string fileType;
        uint256 size;
        uint256 timestamp;
        bool isPrivate;
    }


    mapping(uint256 => File) public files;

    mapping(uint256 => address) public fileOwners;

    mapping(address => uint256[]) public userFiles;

    uint256 public fileCount;

    event FileUploaded(uint256 indexed fileId, address indexed owner, string ipfsHash);
    event FileShared(uint256 indexed fileId, address indexed sharedWith);

    function uploadFile(
        string memory _ipfsHash,
        string memory _name,
        string memory _fileType,
        uint256 _size,
        bool _isPrivate
    ) public returns (uint256) {
        uint256 fileId = fileCount++;

        files[fileId] = File({
            ipfsHash: _ipfsHash,
            name: _name,
            fileType: _fileType,
            size: _size,
            timestamp: block.timestamp,
            isPrivate: _isPrivate
        });

        fileOwners[fileId] = msg.sender;
        userFiles[msg.sender].push(fileId);

        emit FileUploaded(fileId, msg.sender, _ipfsHash);

        return fileId;
    }

    function getFile(uint256 _fileId) public view returns (
        string memory ipfsHash,
        string memory name,
        string memory fileType,
        uint256 size,
        uint256 timestamp,
        bool isPrivate,
        address owner
    ) {
        require(_fileId < fileCount, "File does not exist");
        File memory file = files[_fileId];


        if (file.isPrivate) {
            require(fileOwners[_fileId] == msg.sender, "You don't have permission to view this file");
        }

        return (
            file.ipfsHash,
            file.name,
            file.fileType,
            file.size,
            file.timestamp,
            file.isPrivate,
            fileOwners[_fileId]
        );
    }


    function getMyFiles() public view returns (uint256[] memory) {
        return userFiles[msg.sender];
    }
}
