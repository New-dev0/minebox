interface MetaTagsProps {
  title: string
  description?: string
  image?: string
  username?: string
}

export default function MetaTags({ 
  title, 
  description = "Join MineBox - Share your journey, connect with others", 
  image = "/og-image.png",
  username
}: MetaTagsProps) {
  // Update document title
  document.title = `${title} | MineBox`

  // Update meta tags
  const metaTags = [
    { name: 'title', content: title },
    { name: 'description', content: description },
    { property: 'og:title', content: `${title} | MineBox` },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    { property: 'og:type', content: 'profile' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: `${title} | MineBox` },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image }
  ]

  // If username is provided, add profile specific tags
  if (username) {
    metaTags.push(
      { property: 'og:url', content: `${window.location.origin}/${username}` },
      { property: 'profile:username', content: username }
    )
  }

  // Update meta tags
  metaTags.forEach(tag => {
    let element = document.querySelector(`meta[${tag.property ? 'property' : 'name'}="${tag.property || tag.name}"]`)
    
    if (!element) {
      element = document.createElement('meta')
      tag.property 
        ? element.setAttribute('property', tag.property)
        : element.setAttribute('name', tag.name)
      document.head.appendChild(element)
    }
    
    element.setAttribute('content', tag.content)
  })

  return null
} 