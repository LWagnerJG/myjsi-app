import React, { useState, useRef } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { FormInput } from '../../components/common/FormComponents.jsx';
import { X, ImageIcon } from 'lucide-react';

export const CreateContentModal = ({ show, onClose, theme, onCreatePost }) => {
    const [postType, setPostType] = useState('post');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title.trim() && content.trim()) {
            onCreatePost({
                type: postType,
                title: title.trim(),
                content: content.trim(),
                images: images,
                timestamp: new Date().toISOString()
            });
            // Reset form
            setTitle('');
            setContent('');
            setImages([]);
            onClose();
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setImages(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    if (!show) return null;

    return (
        <Modal show={show} onClose={onClose} title="Create New Post" theme={theme}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                        Post Type
                    </label>
                    <div className="flex space-x-2">
                        {['post', 'win', 'poll'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setPostType(type)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform active:scale-95${postType === type ? ' shadow-md' : ''}`}
                                style={{
                                    backgroundColor: postType === type ? theme.colors.accent : theme.colors.subtle,
                                    color: postType === type ? 'white' : theme.colors.textPrimary
                                }}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <FormInput
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter post title..."
                    theme={theme}
                    required
                />

                <FormInput
                    label="Content"
                    type="textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    theme={theme}
                    required
                />

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                        Images
                    </label>
                    <div className="space-y-3">
                        {images.length > 0 && (
                            <div className="grid grid-cols-3 gap-3">
                                {images.map((file, index) => (
                                    <div key={index} className="relative aspect-square">
                                        <img 
                                            src={URL.createObjectURL(file)} 
                                            alt={`preview-${index}`} 
                                            className="w-full h-full object-cover rounded-lg shadow-md" 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => removeImage(index)} 
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 transition-all duration-200 transform active:scale-90"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()} 
                            className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg border-2 border-dashed transition-all duration-200 transform active:scale-95"
                            style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}
                        >
                            <ImageIcon className="w-5 h-5" />
                            <span className="font-semibold">Add Images</span>
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileChange} 
                        />
                    </div>
                </div>

                <div className="flex space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-200 transform active:scale-95"
                        style={{ 
                            backgroundColor: theme.colors.subtle, 
                            color: theme.colors.textPrimary 
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 py-3 px-6 rounded-full font-semibold text-white transition-all duration-200 transform active:scale-95"
                        style={{ backgroundColor: theme.colors.accent }}
                    >
                        Create Post
                    </button>
                </div>
            </form>
        </Modal>
    );
};