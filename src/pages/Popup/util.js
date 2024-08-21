
export const parseDataToOgDataArray = (data) => {
    // Map through the array of links to extract the necessary fields
    return data.map(link => ({
        shortUrl: link.shortUrl,              // Shortened URL
        longUrl: link.longUrl,                // Original long URL
        favicon: link.ogImage !== "none" ? link.ogImage : null,  // Favicon or image if available
        image: link.ogImage !== "none" ? link.ogImage : null,    // Optional image field
        ogDesc: link.ogDesc,                  // Description if available
        ogTitle: link.ogTitle,                // Title if available
        dateCreated: link.dateCreated,        // Date created
    }));
};