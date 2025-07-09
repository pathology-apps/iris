const CommentFilter = (comments) =>
    comments.filter((comment) => comment.TYPE !== 'D')

const ReplyFilter = (comments) =>
    comments.filter((comment) => comment.TYPE !== 'D')

export {CommentFilter, ReplyFilter}
