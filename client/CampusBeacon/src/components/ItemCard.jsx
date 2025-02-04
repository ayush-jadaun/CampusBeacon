import React from "react";
import { FaRupeeSign } from "react-icons/fa";
import { IoMdCall } from "react-icons/io";
import { motion } from "framer-motion";


{/* 
  =========================================
  Re-useable Item Card for Buy & Sell Page 
  =========================================
*/}
function ItemCard({item, key}){

    return(
        <div className="grid md:grid-cols-2 lg:grid-cols-1">
        <motion.div 
        key={item.id}
        initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1 }}
      className="bg-gray-900 rounded-lg p-5 space-y-4 hover:scale-105 transition-all "
      >
        <img 
        src={item.image}
        className="w-full h-48 object-fit rounded-lg"
        />
        <div className="flex justify-between items-center grid md:grid-cols-2">
            <h2 className="text-xl font-bold mr-2">{item.name}</h2>
            <h2 className="text-green-400 font-semibold mt-5 flex "><FaRupeeSign className="mt-1" />{item.price}</h2>
            <p className="text-gray-300 pt-3 pb-3 pr-3">{item.description}</p>
            <div className="flex justify-between items-center">
                <span className="text-sm bg-blue-600 px-2 py-2 rounded-full mb-5  ">{item.condition}</span>
            </div>
            <button className="flex items-center bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
          <IoMdCall size={24} className="mr-2" /> Contact +91{item.contact}
          </button>
        </div>
      </motion.div>
      </div>
    );
};

export default ItemCard;