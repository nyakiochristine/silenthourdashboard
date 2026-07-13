// Helper to map our app's genres to Open Library subjects
const genreToSubject = {
  'Fiction': 'fiction',
  'Non-Fiction': 'nonfiction',
  'Sci-Fi': 'science_fiction',
  'Biography': 'biography',
  'Poetry': 'poetry',
  'Self-Help': 'self_help',
  'History': 'history'
}

export const generateRecommendations = async (readingHistory) => {
  // 1. Determine the user's most read genre (or default to fiction)
  let targetGenre = 'Fiction'
  
  if (readingHistory && readingHistory.length > 0) {
    const genreCounts = readingHistory.reduce((acc, book) => {
      const g = book.genre || 'Fiction'
      acc[g] = (acc[g] || 0) + 1
      return acc
    }, {})
    
    // Find the genre with the highest count
    targetGenre = Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b)
  }

  const subject = genreToSubject[targetGenre] || 'fiction'

  // 2. Fetch popular books in this subject from Open Library
  try {
    const response = await fetch(`https://openlibrary.org/subjects/${subject}.json?limit=15`)
    if (!response.ok) throw new Error("Failed to fetch from Open Library")
    
    const data = await response.json()
    const works = data.works || []

    if (works.length === 0) throw new Error("No books found")

    // Shuffle and pick 3 random works so it feels fresh each time
    const shuffled = works.sort(() => 0.5 - Math.random())
    const selectedWorks = shuffled.slice(0, 3)

    // Helper to generate a Goodreads search link
    const getGoodreadsLink = (title, author) => {
      const query = encodeURIComponent(`${title} ${author}`)
      return `https://www.goodreads.com/search?q=${query}`
    }

    // 3. Format to match our UI
    return selectedWorks.map(work => {
      const title = work.title
      const author = work.authors && work.authors.length > 0 ? work.authors[0].name : "Unknown Author"
      
      return {
        title: title,
        author: author,
        reason: `Because you enjoy ${targetGenre}, this is a highly recommended read from the Open Library archives.`,
        coverUrl: work.cover_id ? `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg` : "",
        downloadUrl: getGoodreadsLink(title, author)
      }
    })

  } catch (error) {
    console.error("Open Library Error:", error)
    throw new Error("Unable to fetch recommendations at this time. Please try again.")
  }
}
