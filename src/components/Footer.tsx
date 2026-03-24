import React from 'react'
import{Link}from'react-router-dom'

export default function Footer(){
  return(
    <footer style={{borderTop:'1px solid var(--border)',padding:'24px 20px',marginTop:40,position:'relative',zIndex:1}}>
      <div style={{maxWidth:1100,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
        <div>
          <p className="playfair" style={{fontSize:14,fontWeight:600,color:'var(--gold)',marginBottom:4}}>Dev-SMP Casino</p>
          <p style={{fontSize:11,color:'var(--text3)'}}>© 2026 Schmesmalo · All rights reserved · 18+ only · For entertainment purposes only</p>
        </div>
        <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
          {[
            {to:'/terms',label:'Terms'},
            {to:'/privacy',label:'Privacy'},
            {to:'/cookies',label:'Cookies'},
            {to:'/impressum',label:'Impressum'},
          ].map(l=>(
            <Link key={l.to} to={l.to} style={{fontSize:12,color:'var(--text2)',textDecoration:'none',transition:'color .18s'}}
              onMouseEnter={e=>(e.currentTarget.style.color='var(--gold)')}
              onMouseLeave={e=>(e.currentTarget.style.color='var(--text2)')}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
