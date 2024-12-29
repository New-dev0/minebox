import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { FiImage, FiSave, FiX, FiArrowLeft, FiEye, FiEdit2 } from 'react-icons/fi'
import MDEditor from '@uiw/react-md-editor'
import { AnimatedBackground } from '../../components/backgrounds'
import MainNav from '../../components/navigation/MainNav'

export default function NewBlog() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { customColors } = useTheme()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCoverImage(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handlePublish = async () => {
    if (!user) return
    setPublishing(true)

    try {
      let coverUrl = null
      if (coverImage) {
        const fileExt = coverImage.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `blog-covers/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(filePath, coverImage)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(filePath)

        coverUrl = publicUrl
      }

      const { data: blog, error } = await supabase
        .from('blogs')
        .insert({
          user_id: user.id,
          title,
          content,
          cover_image: coverUrl,
          tags,
          published: true
        })
        .select()
        .single()

      if (error) throw error

      // Create timeline event for the blog
      await supabase.from('timeline_events').insert({
        user_id: user.id,
        type: 'blog',
        title: 'Published a new blog post',
        content: { title, preview: content.substring(0, 150) },
        metadata: {
          blog_id: blog.id,
          cover_image: coverUrl
        }
      })

      navigate(`/blog/${blog.id}`)
    } catch (error) {
      console.error('Error publishing blog:', error)
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <MainNav />
      <div className="fixed inset-0 z-0 opacity-50">
        <AnimatedBackground
          sceneType="saturn"
          showTitle={false}
          userColor={customColors.primary}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto pt-24 px-4 pb-20">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: `${customColors.primary}20`,
                color: customColors.primary
              }}
            >
              {previewMode ? (
                <>
                  <FiEdit2 className="w-4 h-4" />
                  <span>Edit</span>
                </>
              ) : (
                <>
                  <FiEye className="w-4 h-4" />
                  <span>Preview</span>
                </>
              )}
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePublish}
              disabled={publishing || !title || !content}
              className="px-6 py-2 rounded-lg flex items-center gap-2 
                       disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: customColors.primary,
                color: 'white'
              }}
            >
              <FiSave className="w-5 h-5" />
              {publishing ? 'Publishing...' : 'Publish'}
            </motion.button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 bg-black/40 backdrop-blur-xl rounded-2xl p-6 border"
          style={{ borderColor: `${customColors.primary}20` }}
        >
          {/* Cover Image Upload */}
          <div 
            className="h-80 rounded-xl overflow-hidden relative group"
            style={{ 
              border: `1px solid ${customColors.primary}20`,
              background: coverPreview ? 
                `url(${coverPreview}) center/cover` : 
                `${customColors.primary}10`
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
              id="cover-upload"
            />
            <label
              htmlFor="cover-upload"
              className="absolute inset-0 flex items-center justify-center 
                       bg-black/50 opacity-0 group-hover:opacity-100 
                       transition-opacity cursor-pointer"
            >
              <div className="flex items-center gap-2 text-white">
                <FiImage className="w-6 h-6" />
                <span>{coverPreview ? 'Change Cover Image' : 'Upload Cover Image'}</span>
              </div>
            </label>
          </div>

          {/* Title Input */}
          <input
            type="text"
            placeholder="Write an engaging title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 text-3xl font-bold bg-black/20 
                     border rounded-lg focus:outline-none focus:ring-2"
            style={{ 
              borderColor: `${customColors.primary}20`,
              color: 'white',
            }}
          />

          {/* Tags Input */}
          <div className="flex flex-wrap gap-2 items-center p-3 rounded-lg bg-black/20 border"
               style={{ borderColor: `${customColors.primary}20` }}>
            {tags.map(tag => (
              <span 
                key={tag}
                className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                style={{ 
                  backgroundColor: `${customColors.primary}20`,
                  color: customColors.primary
                }}
              >
                #{tag}
                <button onClick={() => handleRemoveTag(tag)}>
                  <FiX className="w-4 h-4" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Add tags... (press Enter)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="flex-1 px-3 py-1 bg-transparent text-white placeholder-gray-500 
                       focus:outline-none min-w-[200px]"
            />
          </div>

          {/* Markdown Editor */}
          <div data-color-mode="dark" className="min-h-[500px]">
            <MDEditor
              value={content}
              onChange={value => setContent(value || '')}
              preview={previewMode ? "preview" : "edit"}
              height={500}
              className="!bg-black/20 border rounded-lg overflow-hidden"
              style={{ 
                borderColor: `${customColors.primary}20`,
              }}
            />
          </div>

          {/* Word Count */}
          <div className="text-sm text-gray-400 text-right">
            {content.split(/\s+/).filter(Boolean).length} words
          </div>
        </motion.div>
      </div>
    </div>
  )
} 