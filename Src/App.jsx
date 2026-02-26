import { useState, useEffect, useRef } from "react";

const CATEGORIES = ["Breakfast","Lunch","Dinner","Dessert","Snack","Appetizer","Beverage","Salads","Breads"];
const COOK_METHODS = ["Baked","No-Bake","Fried","Grilled","Steamed","Slow Cooker","Instant Pot","Raw","Roasted","Boiled","Sautéed","Broiled"];

const COMMON_INGREDIENTS = [
  "All-purpose flour","Sugar","Brown sugar","Powdered sugar","Butter","Olive oil","Vegetable oil","Eggs","Milk","Heavy cream",
  "Baking powder","Baking soda","Salt","Black pepper","Garlic","Onion","Chicken breast","Ground beef","Bacon",
  "Cheddar cheese","Parmesan cheese","Mozzarella","Sour cream","Cream cheese","Tomatoes","Bell peppers","Mushrooms",
  "Spinach","Broccoli","Carrots","Potatoes","Rice","Pasta","Bread crumbs","Honey","Vanilla extract","Cinnamon",
  "Paprika","Cumin","Oregano","Basil","Thyme","Rosemary","Soy sauce","Worcestershire sauce","Hot sauce","Lemon juice",
  "Chicken broth","Beef broth","Cornstarch","Yeast","Coconut milk","Apple cider vinegar","Dijon mustard","Mayonnaise"
];

const COMMON_MEASUREMENTS = [
  "cup","cups","tablespoon","tablespoons","teaspoon","teaspoons","pound","pounds","ounce","ounces",
  "gram","grams","kilogram","liter","milliliter","pinch","dash","handful","clove","cloves",
  "slice","slices","can","package","bunch","sprig","to taste","as needed"
];

const CATEGORY_EMOJIS = {
  Breakfast:"🍳",Lunch:"🥗",Dinner:"🍽️",Dessert:"🍰",Snack:"🍿",
  Appetizer:"🥨",Beverage:"🥤",Salads:"🥙",Breads:"🍞"
};

const defaultForm = () => ({
  title:"", description:"", category:"Dinner", cookMethod:"Baked",
  cookTime:"", ingredients:[{amount:"", measurement:"cup", ingredient:""}],
  instructions:"", notes:"", favorite:false
});

export default function App() {
  const [recipes, setRecipes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("recipes") || "[]"); } catch { return []; }
  });
  const [categories, setCategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem("categories") || JSON.stringify(CATEGORIES)); } catch { return [...CATEGORIES]; }
  });
  const [view, setView] = useState("home");
  const [selected, setSelected] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [form, setForm] = useState(defaultForm());
  const [editId, setEditId] = useState(null);
  const [newCatInput, setNewCatInput] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    localStorage.setItem("recipes", JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const filtered = recipes.filter(r => {
    const matchCat = activeCategory === "All" || r.category === activeCategory;
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const matchFav = !showFavorites || r.favorite;
    return matchCat && matchSearch && matchFav;
  });

  const openAdd = () => { setForm(defaultForm()); setEditId(null); setView("add"); };
  const openEdit = (r) => {
    setForm({...r, ingredients: r.ingredients.map(i=>({...i}))});
    setEditId(r.id);
    setView("edit");
  };

  const saveRecipe = () => {
    if (!form.title.trim()) { showToast("Please enter a recipe title"); return; }
    if (editId) {
      setRecipes(prev => prev.map(r => r.id === editId ? {...form, id: editId} : r));
      showToast("Recipe updated!");
    } else {
      setRecipes(prev => [...prev, {...form, id: Date.now()}]);
      showToast("Recipe added!");
    }
    setView("home");
  };

  const deleteRecipe = (id) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    setShowDeleteConfirm(null);
    if (view === "detail") setView("home");
    showToast("Recipe deleted");
  };

  const toggleFav = (id) => {
    setRecipes(prev => prev.map(r => r.id === id ? {...r, favorite: !r.favorite} : r));
  };

  const addIngredient = () => {
    setForm(f => ({...f, ingredients: [...f.ingredients, {amount:"", measurement:"cup", ingredient:""}]}));
  };

  const removeIngredient = (i) => {
    setForm(f => ({...f, ingredients: f.ingredients.filter((_,idx) => idx !== i)}));
  };

  const updateIngredient = (i, field, val) => {
    setForm(f => {
      const ing = [...f.ingredients];
      ing[i] = {...ing[i], [field]: val};
      return {...f, ingredients: ing};
    });
  };

  const addCategory = () => {
    const c = newCatInput.trim();
    if (!c || categories.includes(c)) return;
    setCategories(prev => [...prev, c]);
    setNewCatInput("");
    setShowNewCat(false);
    showToast(`Category "${c}" added`);
  };

  const deleteCategory = (cat) => {
    setCategories(prev => prev.filter(c => c !== cat));
    if (activeCategory === cat) setActiveCategory("All");
  };

  return (
    <div style={{minHeight:"100vh",background:"#0f0e0c",color:"#e8dcc8",fontFamily:"'Georgia', 'Times New Roman', serif",position:"relative"}}>
      <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at 20% 20%, rgba(139,90,43,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(180,120,60,0.1) 0%, transparent 60%)",pointerEvents:"none"}}/>

      {toast && (
        <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:"#8b5a2b",color:"#fff",padding:"12px 24px",borderRadius:8,zIndex:1000,fontFamily:"Georgia",fontSize:"0.95rem",boxShadow:"0 4px 20px rgba(0,0,0,0.5)"}}>
          {toast}
        </div>
      )}

      {showDeleteConfirm && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
          <div style={{background:"#1a1714",border:"1px solid #4a3728",borderRadius:12,padding:32,maxWidth:380,textAlign:"center"}}>
            <div style={{fontSize:"2rem",marginBottom:12}}>🗑️</div>
            <h3 style={{margin:"0 0 8px",color:"#e8dcc8"}}>Delete Recipe?</h3>
            <p style={{color:"#a89880",margin:"0 0 24px",fontSize:"0.9rem"}}>This cannot be undone.</p>
            <div style={{display:"flex",gap:12,justifyContent:"center"}}>
              <button onClick={()=>setShowDeleteConfirm(null)} style={btnStyle("secondary")}>Cancel</button>
              <button onClick={()=>deleteRecipe(showDeleteConfirm)} style={btnStyle("danger")}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {view === "home" && <HomeView {...{recipes,filtered,categories,activeCategory,setActiveCategory,search,setSearch,showFavorites,setShowFavorites,openAdd,toggleFav,setShowDeleteConfirm,setView,setSelected,openEdit,showNewCat,setShowNewCat,newCatInput,setNewCatInput,addCategory,deleteCategory}} />}
      {(view === "add" || view === "edit") && <FormView {...{form,setForm,saveRecipe,view,categories,addIngredient,removeIngredient,updateIngredient,setView}} />}
      {view === "detail" && selected && <DetailView recipe={recipes.find(r=>r.id===selected)} onBack={()=>setView("home")} onEdit={()=>openEdit(recipes.find(r=>r.id===selected))} onDelete={()=>setShowDeleteConfirm(selected)} onToggleFav={()=>toggleFav(selected)} />}
    </div>
  );
}

function HomeView({recipes,filtered,categories,activeCategory,setActiveCategory,search,setSearch,showFavorites,setShowFavorites,openAdd,toggleFav,setShowDeleteConfirm,setView,setSelected,openEdit,showNewCat,setShowNewCat,newCatInput,setNewCatInput,addCategory,deleteCategory}) {
  return (
    <div style={{maxWidth:900,margin:"0 auto",padding:"40px 20px"}}>
      <div style={{textAlign:"center",marginBottom:48}}>
        <div style={{fontSize:"0.85rem",letterSpacing:"0.2em",color:"#8b5a2b",textTransform:"uppercase",marginBottom:8}}>
          🍴 {recipes.length} {recipes.length === 1 ? "delicious recipe" : "delicious recipes"}
        </div>
        <h1 style={{fontSize:"clamp(2rem,6vw,3.5rem)",fontWeight:400,margin:"0 0 12px",color:"#f0e6d0",letterSpacing:"-0.02em",lineHeight:1.1}}>
          Your Recipe Collection
        </h1>
        <p style={{color:"#a89880",maxWidth:480,margin:"0 auto 32px",lineHeight:1.6,fontSize:"1rem"}}>
          Discover, save, and organize all your favorite recipes in one beautiful place.
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={openAdd} style={{...btnStyle("primary"),fontSize:"1rem",padding:"14px 28px"}}>+ Add New Recipe</button>
          <button onClick={()=>setShowFavorites(!showFavorites)} style={{...btnStyle(showFavorites?"primary":"secondary"),fontSize:"1rem",padding:"14px 28px"}}>
            {showFavorites ? "♥" : "♡"} Favorites ({recipes.filter(r=>r.favorite).length})
          </button>
        </div>
      </div>

      <div style={{marginBottom:24}}>
        <div style={{fontSize:"0.75rem",letterSpacing:"0.15em",color:"#6b4f3a",textTransform:"uppercase",marginBottom:12}}>Browse by Category</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}}>
          {["All",...categories].map(cat => (
            <button key={cat} onClick={()=>setActiveCategory(cat)} style={{
              padding:"8px 16px",borderRadius:24,border:"1px solid",cursor:"pointer",fontSize:"0.85rem",fontFamily:"Georgia",transition:"all 0.2s",
              background: activeCategory===cat ? "#8b5a2b" : "transparent",
              borderColor: activeCategory===cat ? "#8b5a2b" : "#3a2e24",
              color: activeCategory===cat ? "#fff" : "#a89880",
            }}>
              {cat === "All" ? "🍽️ " : (CATEGORY_EMOJIS[cat] || "🍴 ")}{cat}
            </button>
          ))}
          <button onClick={()=>setShowNewCat(!showNewCat)} style={{...btnStyle("ghost"),padding:"8px 14px",fontSize:"0.8rem"}}>+ Add</button>
          {categories.filter(c=>!CATEGORIES.includes(c)).map(cat=>(
            <button key={"del-"+cat} onClick={()=>deleteCategory(cat)} style={{...btnStyle("ghost"),padding:"8px 14px",fontSize:"0.8rem",color:"#c0392b"}}>🗑 {cat}</button>
          ))}
        </div>
        {showNewCat && (
          <div style={{marginTop:12,display:"flex",gap:8}}>
            <input value={newCatInput} onChange={e=>setNewCatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCategory()} placeholder="New category name..." style={inputStyle()} />
            <button onClick={addCategory} style={btnStyle("primary")}>Add</button>
            <button onClick={()=>setShowNewCat(false)} style={btnStyle("secondary")}>Cancel</button>
          </div>
        )}
      </div>

      <div style={{position:"relative",marginBottom:32}}>
        <span style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:"#6b4f3a",fontSize:"1.1rem"}}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search recipes..." style={{...inputStyle(),paddingLeft:44,fontSize:"1rem",padding:"14px 16px 14px 44px"}} />
      </div>

      {filtered.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px 0",color:"#6b4f3a"}}>
          <div style={{fontSize:"3rem",marginBottom:16}}>📭</div>
          <p style={{fontSize:"1.1rem"}}>No recipes found. Add your first one!</p>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:20}}>
          {filtered.map(r => (
            <RecipeCard key={r.id} recipe={r} onView={()=>{setSelected(r.id);setView("detail");}} onEdit={()=>openEdit(r)} onDelete={()=>setShowDeleteConfirm(r.id)} onToggleFav={()=>toggleFav(r.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecipeCard({recipe,onView,onEdit,onDelete,onToggleFav}) {
  return (
    <div style={{background:"#1a1714",border:"1px solid #2e2318",borderRadius:12,overflow:"hidden",cursor:"pointer",transition:"transform 0.2s,box-shadow 0.2s",position:"relative"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 12px 40px rgba(0,0,0,0.5)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
      <div style={{background:"#231f1b",padding:"20px 20px 16px",minHeight:80,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
        <span style={{fontSize:"2.5rem"}}>{CATEGORY_EMOJIS[recipe.category]||"🍴"}</span>
        <button onClick={e=>{e.stopPropagation();onToggleFav();}} style={{position:"absolute",top:12,right:12,background:"none",border:"none",cursor:"pointer",fontSize:"1.2rem",color:recipe.favorite?"#e74c3c":"#6b4f3a",transition:"color 0.2s"}}>
          {recipe.favorite ? "♥" : "♡"}
        </button>
        <button onClick={e=>{e.stopPropagation();onDelete();}} style={{position:"absolute",top:12,left:12,background:"none",border:"none",cursor:"pointer",fontSize:"0.9rem",color:"#6b4f3a",opacity:0.6}}
          onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity="0.6"}>🗑️</button>
      </div>
      <div style={{padding:"16px 20px 20px"}} onClick={onView}>
        <div style={{fontSize:"0.7rem",letterSpacing:"0.1em",color:"#8b5a2b",textTransform:"uppercase",marginBottom:6}}>{recipe.category}</div>
        <h3 style={{margin:"0 0 6px",color:"#f0e6d0",fontSize:"1.1rem",fontWeight:400}}>{recipe.title}</h3>
        <p style={{margin:"0 0 14px",color:"#7a6a5a",fontSize:"0.85rem",lineHeight:1.5}}>{recipe.description}</p>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          {recipe.cookTime && <span style={{color:"#8b5a2b",fontSize:"0.8rem"}}>⏱ {recipe.cookTime} min</span>}
          {recipe.cookMethod && <span style={{background:"#2a1f15",color:"#a89880",fontSize:"0.75rem",padding:"3px 10px",borderRadius:12,border:"1px solid #3a2e24"}}>{recipe.cookMethod}</span>}
        </div>
      </div>
    </div>
  );
}

function DetailView({recipe,onBack,onEdit,onDelete,onToggleFav}) {
  if (!recipe) return null;
  return (
    <div style={{maxWidth:720,margin:"0 auto",padding:"40px 20px"}}>
      <button onClick={onBack} style={{...btnStyle("ghost"),marginBottom:24}}>← Back</button>
      <div style={{background:"#1a1714",border:"1px solid #2e2318",borderRadius:16,overflow:"hidden"}}>
        <div style={{background:"linear-gradient(135deg,#231f1b,#1a150f)",padding:"40px",textAlign:"center",borderBottom:"1px solid #2e2318"}}>
          <span style={{fontSize:"4rem"}}>{CATEGORY_EMOJIS[recipe.category]||"🍴"}</span>
          <h1 style={{margin:"16px 0 8px",color:"#f0e6d0",fontSize:"2rem",fontWeight:400}}>{recipe.title}</h1>
          <p style={{color:"#a89880",margin:"0 0 20px"}}>{recipe.description}</p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            {recipe.cookTime && <span style={{background:"#2a1f15",border:"1px solid #3a2e24",color:"#a89880",padding:"6px 16px",borderRadius:20,fontSize:"0.85rem"}}>⏱ {recipe.cookTime} min</span>}
            {recipe.cookMethod && <span style={{background:"#2a1f15",border:"1px solid #3a2e24",color:"#a89880",padding:"6px 16px",borderRadius:20,fontSize:"0.85rem"}}>{recipe.cookMethod}</span>}
            <span style={{background:"#2a1f15",border:"1px solid #3a2e24",color:"#a89880",padding:"6px 16px",borderRadius:20,fontSize:"0.85rem"}}>{recipe.category}</span>
          </div>
        </div>
        <div style={{padding:40}}>
          {recipe.ingredients?.length > 0 && (
            <div style={{marginBottom:32}}>
              <h2 style={{color:"#8b5a2b",fontSize:"0.8rem",letterSpacing:"0.15em",textTransform:"uppercase",margin:"0 0 16px"}}>Ingredients</h2>
              <ul style={{margin:0,padding:0,listStyle:"none"}}>
                {recipe.ingredients.map((ing,i)=>(
                  <li key={i} style={{padding:"10px 0",borderBottom:"1px solid #2e2318",color:"#d4c4b0",display:"flex",gap:8}}>
                    <span style={{color:"#8b5a2b",minWidth:100}}>{ing.amount} {ing.measurement}</span>
                    <span>{ing.ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {recipe.instructions && (
            <div style={{marginBottom:24}}>
              <h2 style={{color:"#8b5a2b",fontSize:"0.8rem",letterSpacing:"0.15em",textTransform:"uppercase",margin:"0 0 16px"}}>Instructions</h2>
              <p style={{color:"#d4c4b0",lineHeight:1.8,whiteSpace:"pre-wrap",margin:0}}>{recipe.instructions}</p>
            </div>
          )}
          {recipe.notes && (
            <div style={{background:"#231f1b",border:"1px solid #3a2e24",borderRadius:8,padding:20,marginBottom:24}}>
              <h2 style={{color:"#8b5a2b",fontSize:"0.8rem",letterSpacing:"0.15em",textTransform:"uppercase",margin:"0 0 12px"}}>Notes</h2>
              <p style={{color:"#a89880",margin:0,lineHeight:1.6}}>{recipe.notes}</p>
            </div>
          )}
          <div style={{display:"flex",gap:12,flexWrap:"wrap",paddingTop:8}}>
            <button onClick={onEdit} style={btnStyle("primary")}>✏️ Edit Recipe</button>
            <button onClick={onToggleFav} style={btnStyle("secondary")}>{recipe.favorite ? "♥ Unfavorite" : "♡ Favorite"}</button>
            <button onClick={onDelete} style={btnStyle("danger")}>🗑️ Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormView({form,setForm,saveRecipe,view,categories,addIngredient,removeIngredient,updateIngredient,setView}) {
  const [ingDropdown, setIngDropdown] = useState(null);
  const [measDropdown, setMeasDropdown] = useState(null);
  const setField = (field,val) => setForm(f=>({...f,[field]:val}));

  const filteredIngredients = (q) => q ? COMMON_INGREDIENTS.filter(i=>i.toLowerCase().includes(q.toLowerCase())).slice(0,8) : [];
  const filteredMeasurements = (q) => COMMON_MEASUREMENTS.filter(m=>m.toLowerCase().includes(q.toLowerCase())).slice(0,8);

  return (
    <div style={{maxWidth:720,margin:"0 auto",padding:"40px 20px"}}>
      <button onClick={()=>setView("home")} style={{...btnStyle("ghost"),marginBottom:24}}>← Cancel</button>
      <h1 style={{color:"#f0e6d0",fontWeight:400,marginBottom:32,fontSize:"2rem"}}>{view==="edit"?"Edit Recipe":"New Recipe"}</h1>

      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        <FormGroup label="Recipe Title *">
          <input value={form.title} onChange={e=>setField("title",e.target.value)} placeholder="e.g. Grandma's Apple Pie" style={inputStyle()} />
        </FormGroup>

        <FormGroup label="Short Description">
          <input value={form.description} onChange={e=>setField("description",e.target.value)} placeholder="A brief description..." style={inputStyle()} />
        </FormGroup>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <FormGroup label="Category">
            <select value={form.category} onChange={e=>setField("category",e.target.value)} style={inputStyle()}>
              {categories.map(c=><option key={c}>{c}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Cook Method">
            <select value={form.cookMethod} onChange={e=>setField("cookMethod",e.target.value)} style={inputStyle()}>
              {COOK_METHODS.map(m=><option key={m}>{m}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Cook Time (min)">
            <input type="number" value={form.cookTime} onChange={e=>setField("cookTime",e.target.value)} placeholder="e.g. 30" style={inputStyle()} />
          </FormGroup>
        </div>

        <FormGroup label="Ingredients">
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {form.ingredients.map((ing,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",position:"relative"}}>
                <input value={ing.amount} onChange={e=>updateIngredient(i,"amount",e.target.value)} placeholder="Amt" style={{...inputStyle(),width:60,flexShrink:0}} />
                <div style={{position:"relative",width:130,flexShrink:0}}>
                  <input value={ing.measurement} onChange={e=>{updateIngredient(i,"measurement",e.target.value);setMeasDropdown(i);}}
                    onFocus={()=>setMeasDropdown(i)} placeholder="Unit" style={inputStyle()} />
                  {measDropdown===i && (
                    <Dropdown items={filteredMeasurements(ing.measurement)} onSelect={v=>{updateIngredient(i,"measurement",v);setMeasDropdown(null);}} onClose={()=>setMeasDropdown(null)} />
                  )}
                </div>
                <div style={{position:"relative",flex:1}}>
                  <input value={ing.ingredient} onChange={e=>{updateIngredient(i,"ingredient",e.target.value);setIngDropdown(i);}}
                    onFocus={()=>{ if(ing.ingredient) setIngDropdown(i); }} placeholder="Ingredient name" style={inputStyle()} />
                  {ingDropdown===i && filteredIngredients(ing.ingredient).length > 0 && (
                    <Dropdown items={filteredIngredients(ing.ingredient)} onSelect={v=>{updateIngredient(i,"ingredient",v);setIngDropdown(null);}} onClose={()=>setIngDropdown(null)} />
                  )}
                </div>
                <button onClick={()=>removeIngredient(i)} style={{background:"none",border:"1px solid #3a2e24",color:"#c0392b",cursor:"pointer",borderRadius:6,padding:"10px 12px",flexShrink:0}}>✕</button>
              </div>
            ))}
            <button onClick={addIngredient} style={{...btnStyle("ghost"),alignSelf:"flex-start"}}>+ Add Ingredient</button>
          </div>
        </FormGroup>

        <FormGroup label="Instructions">
          <textarea value={form.instructions} onChange={e=>setField("instructions",e.target.value)} placeholder="Step by step instructions..." rows={6} style={{...inputStyle(),resize:"vertical"}} />
        </FormGroup>

        <FormGroup label="Notes / Tips">
          <textarea value={form.notes} onChange={e=>setField("notes",e.target.value)} placeholder="Optional notes or tips..." rows={3} style={{...inputStyle(),resize:"vertical"}} />
        </FormGroup>

        <div style={{display:"flex",gap:12,paddingTop:8}}>
          <button onClick={saveRecipe} style={{...btnStyle("primary"),fontSize:"1rem",padding:"14px 32px"}}>{view==="edit"?"Save Changes":"Add Recipe"}</button>
          <button onClick={()=>setView("home")} style={{...btnStyle("secondary"),fontSize:"1rem",padding:"14px 24px"}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Dropdown({items,onSelect,onClose}) {
  useEffect(()=>{
    const handler = ()=>onClose();
    setTimeout(()=>document.addEventListener("click",handler),0);
    return ()=>document.removeEventListener("click",handler);
  },[]);
  if (!items.length) return null;
  return (
    <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#231f1b",border:"1px solid #3a2e24",borderRadius:8,zIndex:100,maxHeight:200,overflowY:"auto",boxShadow:"0 8px 24px rgba(0,0,0,0.5)"}}>
      {items.map(item=>(
        <div key={item} onClick={e=>{e.stopPropagation();onSelect(item);}} style={{padding:"10px 14px",cursor:"pointer",color:"#d4c4b0",fontSize:"0.9rem"}}
          onMouseEnter={e=>e.currentTarget.style.background="#2e2318"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          {item}
        </div>
      ))}
    </div>
  );
}

function FormGroup({label,children}) {
  return (
    <div>
      <label style={{display:"block",fontSize:"0.75rem",letterSpacing:"0.1em",color:"#8b5a2b",textTransform:"uppercase",marginBottom:8}}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = () => ({
  width:"100%",background:"#1a1714",border:"1px solid #3a2e24",borderRadius:8,color:"#e8dcc8",
  padding:"12px 14px",fontSize:"0.95rem",fontFamily:"Georgia,serif",outline:"none",boxSizing:"border-box",
});

const btnStyle = (type) => ({
  padding:"10px 20px",borderRadius:8,cursor:"pointer",fontFamily:"Georgia,serif",fontSize:"0.9rem",transition:"all 0.2s",border:"1px solid",
  ...(type==="primary" ? {background:"#8b5a2b",color:"#fff",borderColor:"#8b5a2b"} :
     type==="secondary" ? {background:"transparent",color:"#a89880",borderColor:"#3a2e24"} :
     type==="ghost" ? {background:"transparent",color:"#6b4f3a",borderColor:"transparent"} :
     type==="danger" ? {background:"#c0392b",color:"#fff",borderColor:"#c0392b"} : {})
});
