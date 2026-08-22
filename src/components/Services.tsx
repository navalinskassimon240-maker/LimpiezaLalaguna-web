import React from 'react';
import { motion } from 'motion/react';
import { siteConfig } from '../data/config';

export function Services() {
  return (
    <section id="servicios" className="py-24 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 drop-shadow-sm">{siteConfig.servicios.titulo}</h2>
          <p className="text-lg text-slate-600">
            {siteConfig.servicios.descripcion}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 perspective-1000">
          {siteConfig.servicios.lista.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)', rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', rotateX: 0 }}
              whileHover={{ scale: 1.05, y: -10, rotateX: 5, rotateY: -5 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 hover:shadow-2xl hover:shadow-blue-900/10 hover:border-blue-300 transition-all duration-300 border border-slate-200 group transform-style-3d relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:shadow-md transition-all duration-300 transform group-hover:scale-110">
                {service.icono}
              </div>
              <h3 className="relative z-10 text-xl font-bold text-slate-900 mb-3">{service.titulo}</h3>
              <p className="relative z-10 text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors">
                {service.descripcion}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
