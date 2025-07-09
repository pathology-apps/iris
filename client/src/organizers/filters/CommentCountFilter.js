export default function CommentCountFilter(comments) {
    let replyCount = 0

    if (!comments || !comments.length) {
        return replyCount
    }

    comments.forEach((comment) => {
        if (comment.RPL && comment.RPL.length) {
            replyCount += comment.RPL.filter(
                (reply) => reply.TYPE !== 'D',
            ).length
        }
    })

    return (
        comments.filter((comment) => comment.TYPE !== 'D').length + replyCount
    )
}
