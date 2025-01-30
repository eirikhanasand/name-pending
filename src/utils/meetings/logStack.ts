export default function logStack(error: any) {
    if (error.response) {
        // Server responded with a status other than 2xx
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
        console.error('Response headers:', error.response.headers)
    } else if (error.request) {
        // Request was made but no response received
        console.error('Request data:', error.request)
    } else {
        // Something else went wrong
        console.error('Error message:', error.message)
    }
}
