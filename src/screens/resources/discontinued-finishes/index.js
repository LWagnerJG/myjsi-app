import React, { useState } from 'react';
import { DISCONTINUED_FINISHES } from './data.js';

const FinishCard = ({ item }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    React.createElement('div',{className:'flex flex-col items-center text-center space-y-2'},
      React.createElement('div',{className:'w-24 h-24 rounded-xl overflow-hidden relative', style:{background:'#f1f1f1'}},
        !loaded && React.createElement('div',{className:'absolute inset-0 animate-pulse bg-neutral-200'}),
        React.createElement('picture',null,
          React.createElement('source',{srcSet:item.newImage.replace(/\.jpg$/i,'.webp'), type:'image/webp'}),
          React.createElement('img',{loading:'lazy', width:item.width||300, height:item.height||300, src:item.newImage, alt:item.newName, onLoad:()=>setLoaded(true), className:'w-full h-full object-cover'})
        )
      ),
      React.createElement('div',{className:'text-xs font-semibold'}, item.newName),
      React.createElement('div',{className:'text-[10px] text-neutral-500 line-clamp-2'}, `Replaces ${item.oldName}`)
    )
  );
};

const DiscontinuedFinishesScreen = ({ theme }) => (
  React.createElement('div',{className:'p-4 space-y-6'},
    React.createElement('h1',{className:'text-xl font-bold', style:{color:theme.colors.textPrimary}},'Discontinued Finishes'),
    React.createElement('div',{className:'grid grid-cols-3 gap-4'},
      DISCONTINUED_FINISHES.map(f => React.createElement(FinishCard,{key:f.id,item:f}))
    )
  )
);

export default DiscontinuedFinishesScreen;