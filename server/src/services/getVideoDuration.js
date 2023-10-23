import ytdl from 'youtube-dl-exec'

const getDuration = async (fullUrl) => {
    try {
        const duration = await ytdl.exec(fullUrl, {getDuration: true})
        const MinSecParts = duration.stdout.split(':')
        if (MinSecParts.length == 0) {
            return
        } else if (MinSecParts.length == 1) {
            return parseInt(MinSecParts[0])
        } else if (MinSecParts.length == 2) {
            const min = parseInt(MinSecParts[0])
            const sec = parseInt(MinSecParts[1])
            return min*60 + sec
        } else if (MinSecParts.length == 3) {
            const hour = parseInt(MinSecParts[0])
            const min = parseInt(MinSecParts[1])
            const sec = parseInt(MinSecParts[2])
            return hour*60*60 + min*60 + sec
        } else
        return
    } catch(err) {
        return err
    }
}

export default getDuration