import { useState, useEffect } from 'react';
import { Box, Text, Spinner, Alert, AlertIcon, AlertTitle, VStack, Center, Heading, Button, Container } from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { FaFileUpload } from 'react-icons/fa';
import axios from 'axios';

function DragAndDrop() {
  const [uploadedFileTitles, setUploadedFileTiles] = useState([]);
  const [uploadedFileNames, setUploadedFileNames] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedFileTitle, setSelectedFileTitle] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summary, setSummary] = useState('');
  
  const handleDrop = (acceptedFiles) => {
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);
    console.log(acceptedFiles[0])
    setIsUploading(true);
    setLoadingSummary(false);
    setTimeout(() => {axios.post('http://localhost:4949/upload',
      formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        mode: 'cors',
      }
    ).then((response) => {
      if (response.status === 200) {
        const title = response.data.title;
        const summary = response.data.summary;
        setUploadedFileTiles([...uploadedFileTitles, title]);
        setUploadedFileNames([...uploadedFileNames, acceptedFiles[0].name]);
        setSummary(summary);
      } else {
        alert('Failed to upload PDF file');
      }
      setIsUploading(false);
      setIsSuccess(true);
      setLoadingSummary(true);
    })
    .catch((error) => {
      console.error(error);
      alert('An error occurred while uploading the PDF file');
      setIsUploading(false);
    });
    }, 3000);
  };

  const handleItemClick = (fileTitleIndex) => {
    // TODO: send request to backend to get summary
    // TODO: display summary in the text area
    setSelectedFileTitle(uploadedFileTitles[fileTitleIndex]);
    setLoadingSummary(false);
    setTimeout(() => {
      axios.post('http://localhost:4949/handle_summary',
        {
          file_name: uploadedFileNames[fileTitleIndex]
        }
      ).then((response) => {
        if (response.status === 200) {
          const summary = response.data.summary;
          setSummary(summary);
        } else {
          alert('Failed to get summary');
        }
        setLoadingSummary(true);
      })
      .catch((error) => {
        console.error(error);
        alert('An error occurred while getting the summary');
        setLoadingSummary(false);
      });
    }, 3000);
  }
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSuccess(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [isSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: handleDrop });

  return (
    <Container>
      <div style={{minHeight: "100vh", display: "flex"}}>
        <Box alignItems="center" justifyContent="center" flex="1" marginTop="5">
          <Text> Summary of the paper </Text>
          {loadingSummary && (
            <Center mt={8} border="1px" borderColor="gray.200" p={4}>
              <Heading size="md">{summary}</Heading>
            </Center>
          )}
        </Box>
      </div>
    <Box 
      width="300px"
      position="absolute"
      left="30"
      top="150"
    >
      <Box
        {...getRootProps()}
        border="2px dashed gray"
        borderRadius="md"
        p="4"
        transform="translateY(-50%)"
        borderWidth="2px"
        borderStyle="dashed"
        rounded="md"
        textAlign="center"
        borderColor={isDragActive ? 'green.400' : 'gray.200'}
        _hover={{
          borderColor: 'gray.300',
        }}
        cursor="pointer"
      >
        <input {...getInputProps()} />
        <Box as={FaFileUpload} color="gray.500" mb="2" />
        <Text fontSize="md" color="gray.500" fontWeight="medium">
          {isDragActive ? 'Drop files here' : 'Drag and drop files here or click to upload'}
        </Text>
        {isUploading && (
          <Box mt="4">
            <Spinner size="xl" />
            <Box mt="4" fontWeight="semibold" fontSize="lg">
              Uploading file...
            </Box>
          </Box>
        )}
        {isSuccess && (
          <Box mt="4">
            <Alert status="success">
              <AlertIcon />
              <AlertTitle>File uploaded successfully!</AlertTitle>
            </Alert>
          </Box>
        )}
      </Box>
      <VStack 
        pb={4} 
        spacing={4} 
        border="2px dashed gray"
        borderRadius="md"
        borderWidth="2px"
        borderStyle="dashed"
        rounded="md"
        textAlign="center"
        borderColor={'gray.200'}
      >
      {uploadedFileTitles.length > 0 ? (
        uploadedFileTitles.map((title, index) => (
        <Box
          key={index}
          bg={selectedFileTitle === title ? 'gray.200' : 'white'}
          p="2"
          m="2"
          borderRadius="md"
          cursor="pointer"
          borderWidth="1px"
          borderColor="gray.200"
          _hover={{
            bg: 'gray.100',
          }}
          onClick={() => handleItemClick(index)}
        >
          <Text fontSize='md'>{title}</Text>
        </Box>
          // {/* <Box key={index}> */}
            // {/* <Text>{file}</Text> */}
          // {/* </Box> */}
        ))
      ) : (
        <Text fontSize="md" color="gray.500" fontWeight="medium">None file is uploaded yet</Text>
      )}
      </VStack>
    </Box>
    </Container>
  );
}
export default DragAndDrop;